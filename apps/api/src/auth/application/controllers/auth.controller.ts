import {
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
	UnauthorizedException,
	NotFoundException,
	Logger,
	InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthApplicationService } from '../services/auth.application.service';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { User } from 'src/common/types/user.interface';
import { Permission } from 'src/auth/domain/enums/permission.enum';
import { rolePermissions } from 'src/auth/infrastructure/configs/role-permissions.config';
import { JwtRefreshGuard } from 'src/auth/infrastructure/guards/refresh.guard';
import { GoogleUser } from 'src/auth/infrastructure/strategies/google.strategy';

interface RequestWithCookies extends Request {
	cookies: Record<string, string>;
}

interface AuthenticatedRequest extends Request {
	user: {
		id: string;
		email: string;
		name: string;
		roles: string[];
	};
}

@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(
		private authService: AuthApplicationService,
		private config: ConfigService,
	) {}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	googleLogin() {
		this.logger.log('Google authentication initiated');
		return { message: 'Google authentication initiated' };
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async getCurrentUser(
		@Req() req: AuthenticatedRequest,
	): Promise<User & { permissions: Permission[] }> {
		try {
			const userId = req.user?.id;

			if (!userId) {
				this.logger.warn('No user ID found in request');
				throw new UnauthorizedException('Invalid user session');
			}

			this.logger.debug(`Getting current user: ${userId}`);

			const user = await this.authService.findUserById(userId);

			if (!user) {
				this.logger.warn(`User not found: ${userId}`);
				throw new NotFoundException('User not found');
			}

			// Calcular permisos basados en roles
			const userPermissions = this.calculateUserPermissions(user.roles);

			this.logger.debug(
				`Retrieved user ${userId} with ${userPermissions.length} permissions`,
			);

			return {
				...user,
				permissions: userPermissions,
			};
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof UnauthorizedException
			) {
				throw error;
			}
			this.logger.error('Error getting current user', error);
			throw new InternalServerErrorException(
				'Failed to retrieve user information',
			);
		}
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	async logout(
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const userId = req.user?.id;

			if (userId) {
				// Revocar todos los refresh tokens del usuario para logout completo
				await this.authService.revokeAllUserRefreshTokens(userId);
				this.logger.log(
					`User ${userId} logged out - all tokens revoked`,
				);
			}

			// Limpiar cookie de refresh token
			this.clearRefreshTokenCookie(res);

			return { message: 'Logged out successfully' };
		} catch (error) {
			this.logger.error('Error during logout', error);
			// Aún así limpiar la cookie
			this.clearRefreshTokenCookie(res);
			return { message: 'Logged out successfully' };
		}
	}

	@Post('refresh')
	@UseGuards(JwtRefreshGuard)
	async refreshToken(
		@Req() req: RequestWithCookies,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			this.logger.debug('Attempting to refresh token...');

			const refreshToken = req.cookies?.['refresh_token'];

			if (!refreshToken) {
				this.logger.warn('No refresh token found in cookies');
				this.clearRefreshTokenCookie(res);
				throw new UnauthorizedException('Refresh token not found');
			}

			this.logger.debug(
				`Processing refresh token: ${refreshToken.substring(0, 10)}...`,
			);

			const { accessToken, refreshToken: newRefreshToken } =
				await this.authService.handleRefresh(refreshToken);

			this.logger.debug('Tokens refreshed successfully');

			// Establecer nueva cookie de refresh token
			this.setRefreshTokenCookie(res, newRefreshToken);

			return {
				accessToken,
				message: 'Tokens refreshed successfully',
			};
		} catch (error) {
			this.logger.error('Error refreshing token', error);
			this.clearRefreshTokenCookie(res);

			if (error instanceof UnauthorizedException) {
				throw error;
			}

			throw new UnauthorizedException('Failed to refresh token');
		}
	}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleLoginCallback(
		@Req() req: { user: GoogleUser },
		@Res() res: Response,
	) {
		const frontendUrl = this.config.get('FRONTEND_URL');

		if (!frontendUrl) {
			this.logger.error('FRONTEND_URL not configured');
			return res.status(500).send('Server configuration error');
		}

		try {
			if (!req.user) {
				this.logger.error('No user data received from Google');
				return res.redirect(
					`${frontendUrl}/auth/login/callback?error=no_user_data`,
				);
			}

			this.logger.log(`Processing Google login for: ${req.user.email}`);

			const user: User =
				await this.authService.findOrCreateUserFromGoogle(req.user);

			const accessToken = this.authService.generateAccessToken(user);
			const refreshToken =
				await this.authService.generateRefreshToken(user);

			// Configurar cookie de refresh token
			this.setRefreshTokenCookie(res, refreshToken);

			this.logger.log(
				`Google authentication successful for user: ${user.id}`,
			);
			this.logger.debug(`Generated tokens for user: ${user.id}`);

			// Redirigir al frontend con el access token
			return res.redirect(
				`${frontendUrl}/auth/login/callback?token=${accessToken}`,
			);
		} catch (error) {
			this.logger.error('Google authentication failed', error);

			// Determinar tipo de error para mejor UX
			let errorCode = 'auth_failed';
			if (
				error instanceof Error &&
				error.message?.includes('Invalid user data')
			) {
				errorCode = 'invalid_user_data';
			} else if (
				error instanceof Error &&
				error.message?.includes('Failed to process')
			) {
				errorCode = 'processing_failed';
			}

			return res.redirect(
				`${frontendUrl}/auth/login/callback?error=${errorCode}`,
			);
		}
	}

	// Método adicional para verificar el estado de autenticación
	@Get('status')
	@UseGuards(JwtAuthGuard)
	async getAuthStatus(@Req() req: AuthenticatedRequest) {
		try {
			const userId = req.user?.id;

			if (!userId) {
				throw new UnauthorizedException('Invalid session');
			}

			// Verificar que el usuario aún existe
			const user = await this.authService.findUserById(userId);

			if (!user) {
				throw new UnauthorizedException('User no longer exists');
			}

			return {
				authenticated: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					roles: user.roles,
				},
				permissions: this.calculateUserPermissions(user.roles),
			};
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			this.logger.error('Error checking auth status', error);
			throw new InternalServerErrorException(
				'Failed to check authentication status',
			);
		}
	}

	// Método para logout completo (revocar todos los tokens)
	@Post('logout-all')
	@UseGuards(JwtAuthGuard)
	async logoutAll(
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const userId = req.user?.id;

			if (!userId) {
				throw new UnauthorizedException('Invalid session');
			}

			await this.authService.revokeAllUserRefreshTokens(userId);
			this.clearRefreshTokenCookie(res);

			this.logger.log(`All sessions revoked for user: ${userId}`);

			return {
				message: 'All sessions logged out successfully',
			};
		} catch (error) {
			this.logger.error('Error during logout all', error);
			this.clearRefreshTokenCookie(res);

			if (error instanceof UnauthorizedException) {
				throw error;
			}

			throw new InternalServerErrorException(
				'Failed to logout all sessions',
			);
		}
	}

	// Métodos privados helper
	private calculateUserPermissions(roles: string[]): Permission[] {
		const userPermissions: Permission[] = roles.reduce((acc, role) => {
			const permissionsForRole = (rolePermissions[
				role as keyof typeof rolePermissions
			] || []) as Permission[];
			return [...new Set([...acc, ...permissionsForRole])];
		}, [] as Permission[]);

		return userPermissions;
	}

	private setRefreshTokenCookie(res: Response, refreshToken: string): void {
		const isProduction = this.config.get('NODE_ENV') === 'production';
		const cookieDomain = this.config.get('COOKIE_DOMAIN');

		res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'strict' : 'lax',
			domain: cookieDomain,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
			path: '/',
		});

		this.logger.debug('Refresh token cookie set');
	}

	private clearRefreshTokenCookie(res: Response): void {
		const cookieDomain = this.config.get('COOKIE_DOMAIN');

		res.clearCookie('refresh_token', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			domain: cookieDomain,
			path: '/',
		});

		this.logger.debug('Refresh token cookie cleared');
	}
}
