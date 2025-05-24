// src/auth/guards/jwt-refresh.guard.spec.ts
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import {
  MOCK_VALID_REFRESH_TOKEN,
  MOCK_INVALID_REFRESH_TOKEN,
  mockUserFromAuthService,
  mockRequestWithRefreshToken,
  mockRequestWithoutRefreshToken,
} from './mocks/jwt-refresh.guard.mocks'; // Adjust path
import { JwtRefreshGuard } from 'src/auth/guards/refresh.guard';
import { AuthService } from 'src/auth/auth.service';

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard;
  let mockAuthService: jest.Mocked<AuthService>;

  // Helper to create ExecutionContext
  const createMockExecutionContext = (request: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request as Request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    // Create a mock for AuthService
    mockAuthService = {
      validateRefreshToken: jest.fn(),
      // Add other methods of AuthService as jest.fn() if guard uses them
    } as unknown as jest.Mocked<AuthService>;

    guard = new JwtRefreshGuard(mockAuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if refresh token is not found in cookies', async () => {
    const context = createMockExecutionContext(mockRequestWithoutRefreshToken);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Refresh token not found'),
    );
    expect(mockAuthService.validateRefreshToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if authService.validateRefreshToken throws (invalid token)', async () => {
    mockAuthService.validateRefreshToken.mockRejectedValueOnce(
      new Error('Validation failed'),
    );
    const request = mockRequestWithRefreshToken(MOCK_INVALID_REFRESH_TOKEN);
    const context = createMockExecutionContext(request);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );
    expect(mockAuthService.validateRefreshToken).toHaveBeenCalledWith(
      MOCK_INVALID_REFRESH_TOKEN,
    );
    expect(request.user).toBeUndefined();
  });

  it('should return true and attach user to request if refresh token is valid', async () => {
    mockAuthService.validateRefreshToken.mockResolvedValueOnce(
      mockUserFromAuthService,
    );
    const request = mockRequestWithRefreshToken(MOCK_VALID_REFRESH_TOKEN); // request.user is initially undefined
    const context = createMockExecutionContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockAuthService.validateRefreshToken).toHaveBeenCalledWith(
      MOCK_VALID_REFRESH_TOKEN,
    );
    expect(request.user).toEqual(mockUserFromAuthService);
  });

  it('should handle request with empty string refresh_token cookie as missing', async () => {
    const requestWithEmptyToken = {
      cookies: { refresh_token: '' },
      user: undefined,
    };
    const context = createMockExecutionContext(requestWithEmptyToken);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Refresh token not found'),
    );
    expect(mockAuthService.validateRefreshToken).not.toHaveBeenCalled();
  });

  describe('getRequest method', () => {
    // This method is part of AuthGuard and typically doesn't need extensive testing unless overridden
    // for specific Passport strategy interactions not evident in the provided canActivate.
    // However, since it's explicitly defined, we can add a basic test.
    it('should return the request object from the HTTP context', () => {
      const mockReq = { data: 'test-request' };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
        }),
      } as unknown as ExecutionContext;

      const request = guard.getRequest(context);
      expect(request).toBe(mockReq);
    });
  });
});
