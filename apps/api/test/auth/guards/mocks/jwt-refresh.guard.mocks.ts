import { UserEntity } from 'src/auth/domain/entities/user.entity';
import { Role } from 'src/auth/domain/enums/role.enum';

export const MOCK_VALID_REFRESH_TOKEN = 'valid.refresh.token.string';

export const mockUserFromAuthService: UserEntity = {
	// Or whatever User type authService.validateRefreshToken returns
	id: 'user-id-from-refresh',
	email: 'refreshed@example.com',
	name: 'Refreshed User',
	roles: [Role.USER],
	googleId: '',
	createdAt: new Date(),
	updatedAt: new Date(),
};

// Mock request with refresh token in cookies
export const mockRequestWithRefreshToken = (
	token: string = MOCK_VALID_REFRESH_TOKEN,
) => ({
	cookies: {
		refresh_token: token,
	},
	user: undefined as any, // To check if user gets attached
});

// Mock request without refresh token in cookies
export const mockRequestWithoutRefreshToken = {
	cookies: {},
	user: undefined as any,
};
