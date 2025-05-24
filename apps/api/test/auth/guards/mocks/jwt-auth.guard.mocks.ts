import { Role } from 'src/auth/enums/role.enum';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';

export const MOCK_VALID_JWT_TOKEN = 'mock.valid.jwt.token';
export const MOCK_INVALID_JWT_TOKEN = 'mock.invalid.jwt.token';
export const MOCK_JWT_SECRET = 'test-jwt-secret-from-config';

export const mockJwtPayload: JwtPayload = {
  sub: 'user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  roles: [Role.USER.toString(), Role.EDITOR.toString()],
};

export const mockJwtPayloadStrict: JwtPayload = {
  sub: 'user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  roles: [Role.USER, Role.EDITOR],
};

export const mockRequestWithValidToken = (
  token: string = MOCK_VALID_JWT_TOKEN,
) => ({
  headers: {
    authorization: `Bearer ${token}`,
  },
  user: undefined,
});

export const mockRequestWithoutToken = {
  headers: {},
  user: undefined,
};

export const mockRequestWithNonBearerToken = {
  headers: {
    authorization: `Basic someothercredentials`,
  },
  user: undefined,
};
