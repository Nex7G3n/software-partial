import { User } from 'src/common/types/user.interface';
import { UserEntity } from '../entities/user.entity';
import { GoogleUser } from 'src/auth/infrastructure/strategies/google.strategy';

export interface IAuthService {
	findUserById(userId: string): Promise<UserEntity | null>;
	findOrCreateUserFromGoogle(googleUser: GoogleUser): Promise<User>;
	generateAccessToken(user: User): string;
	generateRefreshToken(user: User): Promise<string>;
	validateRefreshToken(token: string): Promise<User>;
	revokeRefreshToken(token: string): Promise<void>;
	handleRefresh(token: string): Promise<{
		accessToken: string;
		refreshToken: string;
	}>;
}
