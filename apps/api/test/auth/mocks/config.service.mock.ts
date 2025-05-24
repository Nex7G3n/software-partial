export const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') {
      return 'test_secret';
    }
    if (key === 'FRONTEND_URL') {
      return 'http://localhost:3000';
    }
    if (key === 'COOKIE_DOMAIN') {
      return 'localhost';
    }
    if (key === 'NODE_ENV') {
      return 'development'; // or 'production' for testing different cookie settings
    }
    return null;
  }),
};
