export const mockJwtService = {
	sign: jest.fn(() => 'mocked_jwt_token'),
	verifyAsync: jest.fn(() =>
		Promise.resolve({ sub: 'user-id', email: 'test@example.com' }),
	),
};
