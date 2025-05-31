export const mockAuthService = {
	findOrCreateUserFromGoogle: jest.fn(),
	generateAccessToken: jest.fn(),
	generateRefreshToken: jest.fn(),
	validateRefreshToken: jest.fn(),
	revokeRefreshToken: jest.fn(),
	revokeAllUserRefreshTokens: jest.fn(),
	handleRefresh: jest.fn(),
	findUserById: jest.fn(),
	cleanupExpiredTokens: jest.fn(),
};
