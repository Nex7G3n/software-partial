import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

import {
  MOCK_VALID_JWT_TOKEN,
  MOCK_INVALID_JWT_TOKEN,
  MOCK_JWT_SECRET,
  mockJwtPayloadStrict as mockJwtPayload, // Using the correctly typed mock payload
  mockRequestWithValidToken,
  mockRequestWithoutToken,
  mockRequestWithNonBearerToken,
} from './mocks/jwt-auth.guard.mocks';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';
import { User } from 'src/common/types/user.interface';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let superCanActivateSpy: jest.SpyInstance;

  const createMockExecutionContext = (request: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn(() => undefined),
    } as unknown as jest.Mocked<ConfigService>;

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return MOCK_JWT_SECRET;
      }
      return undefined;
    });

    guard = new JwtAuthGuard(mockJwtService, mockConfigService);

    superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if super.canActivate returns true', async () => {
    superCanActivateSpy.mockResolvedValue(true);
    const mockRequest = {};
    const context = createMockExecutionContext(mockRequest);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    expect(mockJwtService.verify.mock.calls).toHaveLength(0);
  });

  describe('when super.canActivate returns false (custom logic)', () => {
    it('should deny access if no token is provided', async () => {
      const context = createMockExecutionContext(mockRequestWithoutToken);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      expect(mockJwtService.verify.mock.calls).toHaveLength(0);
    });

    it('should deny access if token is not a Bearer token', async () => {
      const context = createMockExecutionContext(mockRequestWithNonBearerToken);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      expect(mockJwtService.verify.mock.calls).toHaveLength(0);
    });

    it('should deny access if JWT_SECRET is not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const request = mockRequestWithValidToken();
      const context = createMockExecutionContext(request);
      mockJwtService.verify.mockImplementation(() => {
        // Mock what verify does with undefined secret
        throw new Error('Verification error due to missing secret');
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      expect(mockConfigService.get.mock.calls[0][0]).toBe('JWT_SECRET');
      expect(mockJwtService.verify).toHaveBeenCalledWith(MOCK_VALID_JWT_TOKEN, {
        secret: undefined,
      });
      expect(request.user).toBeUndefined();
    });

    it('should deny access if token verification fails (invalid token)', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const request = mockRequestWithValidToken(MOCK_INVALID_JWT_TOKEN);
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        MOCK_INVALID_JWT_TOKEN,
        {
          secret: MOCK_JWT_SECRET,
        },
      );
      expect(request.user).toBeUndefined();
    });

    it('should allow access and attach user to request if token is valid', async () => {
      // mockJwtPayload comes from mocks, its 'roles' property is string[]
      // e.g., ['USER', 'EDITOR']
      mockJwtService.verify.mockReturnValue(mockJwtPayload);
      const request = mockRequestWithValidToken();
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
      expect(mockJwtService.verify).toHaveBeenCalledWith(MOCK_VALID_JWT_TOKEN, {
        secret: MOCK_JWT_SECRET,
      });

      // The guard casts payload.roles (string[]) to Role[] for request.user.roles
      const expectedUser: User = {
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
        name: mockJwtPayload.name,
        // Here, we expect the roles to be of type Role[] as per the User interface
        // and the guard's casting logic: `payload.roles as Role[]`
        roles: [Role.USER, Role.EDITOR], // These are enum members
      };
      expect(request.user).toEqual(expectedUser);
    });
  });
});
