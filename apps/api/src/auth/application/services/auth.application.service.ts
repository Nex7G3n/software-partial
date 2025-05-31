import {
	Injectable,
	UnauthorizedException,
	InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { IAuthService } from 'src/auth/domain/interfaces/IAuthService';
import { RefreshToken } from 'src/auth/domain/entities/refresh-token.entity';
import { UserEntity } from 'src/auth/domain/entities/user.entity';
import { LoggerService } from 'src/logger/infrastructure/services/logger.service';
import { GoogleUser } from 'src/auth/infrastructure/strategies/google.strategy';
import { User } from 'src/common/types/user.interface';
import { Role } from 'src/auth/domain/enums/role.enum';

@Injectable()
export class AuthApplicationService implements IAuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly dataSource: DataSource,
		@InjectRepository(RefreshToken)
		private readonly refreshTokenRepository: Repository<RefreshToken>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly logger: LoggerService,
	) {}

	async findOrCreateUserFromGoogle(googleUser: GoogleUser): Promise<User> {
		if (!googleUser?.email || !googleUser?.googleId || !googleUser?.name) {
			this.logger.error(
				'Invalid Google user data received',
				undefined,
				undefined,
				{ googleUser },
			);
			throw new UnauthorizedException('Invalid user data from Google');
		}

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Busca usuario por googleId o por email
			let user = await queryRunner.manager.findOne(UserEntity, {
				where: [
					{ googleId: googleUser.googleId },
					{ email: googleUser.email },
				],
			});

			if (!user) {
				this.logger.log(
					`Creating new user from Google: ${googleUser.email}`,
				);

				user = queryRunner.manager.create(UserEntity, {
					email: googleUser.email,
					name: googleUser.name,
					roles: [Role.USER],
					googleId: googleUser.googleId,
				});
				await queryRunner.manager.save(UserEntity, user);
			} else {
				let updated = false; // Declare and initialize updated here
				if (!user.googleId) {
					this.logger.log(
						`Linking existing user ${user.id} with Google account ${googleUser.googleId}`,
					);
					user.googleId = googleUser.googleId;
					updated = true; // Set updated to true when googleId is linked
				}

				if (user.email !== googleUser.email) {
					user.email = googleUser.email;
					updated = true;
				}
				if (user.name !== googleUser.name) {
					user.name = googleUser.name;
					updated = true;
				}
				if (updated) {
					await queryRunner.manager.save(UserEntity, user);
					this.logger.log(
						`Updated user ${user.id} information from Google`,
					);
				}
			}

			await queryRunner.commitTransaction();
			this.logger.log(`Successfully processed Google user: ${user.id}`);
			return user;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			this.logger.error(
				'Error processing Google user',
				undefined,
				undefined,
				{
					error,
				},
			);
			throw new InternalServerErrorException(
				'Failed to process user authentication',
			);
		} finally {
			await queryRunner.release();
		}
	}

	generateAccessToken(user: User): string {
		if (!user?.id || !user?.email) {
			throw new UnauthorizedException(
				'Invalid user data for token generation',
			);
		}
		try {
			const payload = {
				sub: user.id,
				email: user.email,
				name: user.name,
				roles: user.roles || [Role.USER],
			};

			const token = this.jwtService.sign(payload, {
				secret: this.configService.get('JWT_SECRET'),
				expiresIn: '15m',
			});

			this.logger.debug(`Generated access token for user: ${user.id}`);
			return token;
		} catch (error) {
			this.logger.error(
				`Error generating access token for user ${user.id}`,
				error,
			);
			throw new InternalServerErrorException(
				'Failed to generate access token',
			);
		}
	}

	async generateRefreshToken(user: User): Promise<string> {
		if (!user?.id) {
			throw new UnauthorizedException(
				'Invalid user data for refresh token generation',
			);
		}

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const token = crypto.randomBytes(40).toString('hex');
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			await queryRunner.manager.update(
				RefreshToken,
				{ userId: user.id, revoked: false },
				{ revoked: true },
			);

			const refreshToken = queryRunner.manager.create(RefreshToken, {
				token,
				userId: user.id,
				expiresAt,
				revoked: false,
			});

			await queryRunner.manager.save(RefreshToken, refreshToken);
			await queryRunner.commitTransaction();

			this.logger.debug(`Generated refresh token for user: ${user.id}`);
			return token;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			this.logger.error(
				`Error generating refresh token for user ${user.id}`,
				error,
			);
			throw new InternalServerErrorException(
				'Failed to generate refresh token',
			);
		} finally {
			await queryRunner.release();
		}
	}

	async validateRefreshToken(token: string): Promise<User> {
		if (!token || typeof token !== 'string') {
			throw new UnauthorizedException('Invalid refresh token format');
		}

		try {
			const refreshToken = await this.refreshTokenRepository.findOne({
				where: { token },
				relations: ['user'],
			});

			if (!refreshToken) {
				this.logger.warn(
					`Refresh token not found: ${token.substring(0, 10)}...`,
				);
				throw new UnauthorizedException('Invalid refresh token');
			}

			if (refreshToken.revoked) {
				this.logger.warn(
					`Attempted to use revoked refresh token: ${token.substring(0, 10)}...`,
				);
				throw new UnauthorizedException(
					'Refresh token has been revoked',
				);
			}

			if (refreshToken.expiresAt < new Date()) {
				this.logger.warn(
					`Attempted to use expired refresh token: ${token.substring(0, 10)}...`,
				);
				throw new UnauthorizedException('Refresh token has expired');
			}

			const user = await this.userRepository.findOne({
				where: { id: refreshToken.userId },
			});

			if (!user) {
				this.logger.error(
					`User not found for valid refresh token: ${refreshToken.userId}`,
				);
				throw new UnauthorizedException('User not found');
			}

			this.logger.debug(`Validated refresh token for user: ${user.id}`);
			return user;
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			this.logger.error('Error validating refresh token', error.message);
			throw new InternalServerErrorException(
				'Failed to validate refresh token',
			);
		}
	}

	async revokeRefreshToken(token: string): Promise<void> {
		if (!token || typeof token !== 'string') {
			throw new UnauthorizedException('Invalid token format');
		}

		try {
			const result = await this.refreshTokenRepository.update(
				{ token },
				{ revoked: true, revokedAt: new Date() }, // Agregar timestamp de revocación
			);

			if (result.affected === 0) {
				this.logger.warn(
					`Attempted to revoke non-existent token: ${token.substring(0, 10)}...`,
				);
				throw new UnauthorizedException('Token not found');
			}

			this.logger.debug(
				`Revoked refresh token: ${token.substring(0, 10)}...`,
			);
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			this.logger.error('Error revoking refresh token', error.message);
			throw new InternalServerErrorException(
				'Failed to revoke refresh token',
			);
		}
	}

	async revokeAllUserRefreshTokens(userId: string): Promise<void> {
		try {
			const result = await this.refreshTokenRepository.update(
				{ userId, revoked: false },
				{ revoked: true, revokedAt: new Date() },
			);

			this.logger.log(
				`Revoked ${result.affected} refresh tokens for user: ${userId}`,
			);
		} catch (error) {
			this.logger.error(
				`Error revoking all tokens for user ${userId}`,
				error,
			);
			throw new InternalServerErrorException(
				'Failed to revoke user tokens',
			);
		}
	}

	async handleRefresh(
		token: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		if (!token || typeof token !== 'string') {
			throw new UnauthorizedException('Invalid refresh token format');
		}

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await this.validateRefreshToken(token);

			await queryRunner.manager.update(
				RefreshToken,
				{ token },
				{ revoked: true, revokedAt: new Date() },
			);

			await queryRunner.commitTransaction();

			const accessToken = this.generateAccessToken(user);
			const refreshToken = await this.generateRefreshToken(user);

			this.logger.log(
				`Successfully refreshed tokens for user: ${user.id}`,
			);

			return {
				accessToken,
				refreshToken,
			};
		} catch (error) {
			await queryRunner.rollbackTransaction();

			if (error instanceof UnauthorizedException) {
				throw error;
			}

			this.logger.error('Error handling token refresh', error.message);
			throw new InternalServerErrorException('Failed to refresh tokens');
		} finally {
			await queryRunner.release();
		}
	}

	async findUserById(userId: string): Promise<UserEntity | null> {
		this.logger.debug(`Attempting to find user by ID: ${userId}`);
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			if (!user) {
				this.logger.warn(`User with ID: ${userId} not found`);
				return null;
			}
			this.logger.debug(`User with ID: ${userId} found`);
			return user;
		} catch (error) {
			this.logger.error(`Error finding user by ID: ${userId}`, error);
			throw new InternalServerErrorException('Error accessing user data');
		}
	}

	async cleanupExpiredTokens(): Promise<void> {
		try {
			const result = await this.refreshTokenRepository.delete({
				expiresAt: LessThan(new Date()),
			});

			this.logger.log(
				`Cleaned up ${result.affected} expired refresh tokens`,
			);
		} catch (error) {
			this.logger.error('Error cleaning up expired tokens', error);
		}
	}
}
