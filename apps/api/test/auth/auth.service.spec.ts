import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { mockJwtService } from './mocks/jwt.service.mock';
import { mockConfigService } from './mocks/config.service.mock';
import { mockRepository, MockRepositoryType } from './mocks/repository.mock';
import { mockLoggerService } from './mocks/logger.service.mock';
import { AuthService } from 'src/auth/auth.service';
import { LoggerService } from 'src/logger/logger.service';
import { UserEntity } from 'src/auth/entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Role } from 'src/auth/enums/role.enum';
import { GoogleUser } from 'src/auth/strategies/google.strategy';
import { mockDataSource, mockQueryRunner } from './mocks/data-source.mock';

type MockRepository<T extends object = any> = MockRepositoryType<T>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let refreshTokenRepository: MockRepository<RefreshToken>;
  let userRepository: MockRepository<UserEntity>;
  let loggerService: LoggerService;

  const mockUser: UserEntity = {
    id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    roles: [Role.USER],
    googleId: 'google-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGoogleUser: GoogleUser = {
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google-id-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(RefreshToken as any),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(UserEntity as any),
          useValue: mockRepository(),
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenRepository = module.get<MockRepository<RefreshToken>>(
      getRepositoryToken(RefreshToken as any),
    );
    userRepository = module.get<MockRepository<UserEntity>>(
      getRepositoryToken(UserEntity as any),
    );
    loggerService = module.get<LoggerService>(LoggerService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateUserFromGoogle', () => {
    it('should create a new user if not found', async () => {
      const manager = mockQueryRunner.manager;

      manager.findOne.mockResolvedValue(null);
      manager.create.mockReturnValue(mockUser); // Simulate create
      manager.save.mockResolvedValue(mockUser);

      const result = await service.findOrCreateUserFromGoogle(mockGoogleUser);
      expect(result).toEqual(mockUser);
      expect(manager.findOne).toHaveBeenCalledTimes(1);
      expect(manager.create).toHaveBeenCalledWith(UserEntity, {
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        roles: [Role.USER],
        googleId: mockGoogleUser.googleId,
      });
      expect(manager.save).toHaveBeenCalledWith(UserEntity, mockUser);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should return existing user and link googleId if found by email but no googleId', async () => {
      const manager = mockQueryRunner.manager;

      const existingUser = { ...mockUser, googleId: null };
      manager.findOne.mockResolvedValue(existingUser);

      manager.save.mockResolvedValue({
        ...existingUser,
        googleId: mockGoogleUser.googleId,
      });

      const result = await service.findOrCreateUserFromGoogle(mockGoogleUser);

      expect(result.googleId).toBe(mockGoogleUser.googleId);
      expect(manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should update user info if changed', async () => {
      const manager = mockQueryRunner.manager;

      const existingUser = { ...mockUser, name: 'Old Name' };
      manager.findOne.mockResolvedValue(existingUser);
      manager.save.mockResolvedValue({
        ...existingUser,
        name: mockGoogleUser.name,
      });

      const result = await service.findOrCreateUserFromGoogle(mockGoogleUser);
      expect(result.name).toBe(mockGoogleUser.name);
      expect(manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid Google user data', async () => {
      await expect(
        service.findOrCreateUserFromGoogle({ email: null } as any),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const manager = mockQueryRunner.manager;

      manager.findOne.mockRejectedValue(new Error('DB error'));
      await expect(
        service.findOrCreateUserFromGoogle(mockGoogleUser),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const token = service.generateAccessToken(mockUser);
      expect(token).toBe('mocked_jwt_token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          roles: mockUser.roles,
        },
        { secret: 'test_secret', expiresIn: '15m' },
      );
    });

    it('should throw UnauthorizedException if user data is invalid', () => {
      // Mock loggerService.error to do nothing
      const originalLoggerError = loggerService.error;
      loggerService.error = jest.fn();

      try {
        expect(() => service.generateAccessToken({ id: null } as any)).toThrow(
          UnauthorizedException,
        );
      } finally {
        // Restore original loggerService.error
        loggerService.error = originalLoggerError;
      }
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and save a refresh token', async () => {
      mockQueryRunner.manager.create.mockImplementation((_, props) => ({
        ...props,
        id: 'refresh-token-id',
      }));
      mockQueryRunner.manager.save.mockResolvedValue({
        id: 'refresh-token-id',
      } as RefreshToken);

      const token = await service.generateRefreshToken(mockUser);
      expect(token).toEqual(expect.any(String)); // crypto.randomBytes
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        RefreshToken,
        { userId: mockUser.id, revoked: false },
        { revoked: true },
      );
      expect(mockQueryRunner.manager.create).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user data is invalid', async () => {
      await expect(
        service.generateRefreshToken({ id: null } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rollback transaction on error during refresh token generation', async () => {
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB error'));
      await expect(service.generateRefreshToken(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('validateRefreshToken', () => {
    const validToken = 'valid_refresh_token_string';
    const mockRefreshTokenEntity: RefreshToken = {
      id: 'rt-id',
      token: validToken,
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
      revoked: false,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate a refresh token and return user', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.validateRefreshToken(validToken);
      expect(user).toEqual(mockUser);
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: validToken },
        relations: ['user'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRefreshTokenEntity.userId },
      });
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      await expect(service.validateRefreshToken(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      await expect(service.validateRefreshToken(validToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is revoked', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        ...mockRefreshTokenEntity,
        revoked: true,
      });
      await expect(service.validateRefreshToken(validToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        ...mockRefreshTokenEntity,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.validateRefreshToken(validToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found for token', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.validateRefreshToken(validToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 1 } as any);
      await service.revokeRefreshToken('some_token');
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { token: 'some_token' },
        { revoked: true, revokedAt: expect.any(Date) },
      );
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      await expect(service.revokeRefreshToken(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token not found to revoke', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 0 } as any);
      await expect(
        service.revokeRefreshToken('non_existent_token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all tokens for a user', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 3 } as any); // Simulate 3 tokens revoked
      await service.revokeAllUserRefreshTokens(mockUser.id);
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.id, revoked: false },
        { revoked: true, revokedAt: expect.any(Date) },
      );
      expect(loggerService.log).toHaveBeenCalledWith(
        `Revoked 3 refresh tokens for user: ${mockUser.id}`, // Hardcoded expected affected count based on mockResolvedValue
      );
    });
  });

  describe('handleRefresh', () => {
    const oldRefreshToken = 'old_refresh_token';
    const newAccessToken = 'new_access_token';
    const newRefreshTokenString = 'new_refresh_token_string';

    beforeEach(() => {
      // Mock validateRefreshToken to succeed for this test block
      jest.spyOn(service, 'validateRefreshToken').mockResolvedValue(mockUser);
      // Mock generateAccessToken
      jest
        .spyOn(service, 'generateAccessToken')
        .mockReturnValue(newAccessToken);
      // Mock generateRefreshToken (the service method, not the crypto part)
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockResolvedValue(newRefreshTokenString);

      mockQueryRunner.manager.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('should handle token refresh successfully', async () => {
      const result = await service.handleRefresh(oldRefreshToken);

      expect(service.validateRefreshToken).toHaveBeenCalledWith(
        oldRefreshToken,
      );
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        RefreshToken,
        { token: oldRefreshToken },
        { revoked: true, revokedAt: expect.any(Date) },
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(service.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(service.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenString,
      });
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      // Mock loggerService.error to do nothing
      const originalLoggerError = loggerService.error;
      loggerService.error = jest.fn();

      try {
        // Reset the spy for this specific test case to avoid interference
        (service.validateRefreshToken as jest.Mock).mockRestore();
        await expect(service.handleRefresh(null as any)).rejects.toThrow(
          UnauthorizedException,
        );
      } finally {
        // Restore original loggerService.error
        loggerService.error = originalLoggerError;
      }
    });

    it('should rollback transaction on error during handleRefresh', async () => {
      (service.validateRefreshToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Validation failed'),
      );
      await expect(service.handleRefresh(oldRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should re-throw UnauthorizedException from validateRefreshToken', async () => {
      (service.validateRefreshToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Token invalid'),
      );
      await expect(service.handleRefresh(oldRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      const user = await service.findUserById(mockUser.id);
      expect(user).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const user = await service.findUserById('non-existent-id');
      expect(user).toBeNull();
    });

    it('should throw InternalServerErrorException on repository error', async () => {
      userRepository.findOne.mockRejectedValue(new Error('DB error'));
      await expect(service.findUserById(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should call delete on refreshTokenRepository with correct criteria', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 2 } as any);
      await service.cleanupExpiredTokens();
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        expiresAt: { $lt: expect.any(Date) },
      });
      expect(loggerService.log).toHaveBeenCalledWith(
        'Cleaned up 2 expired refresh tokens',
      );
    });

    it('should log error if cleanup fails', async () => {
      const error = new Error('Cleanup failed');
      refreshTokenRepository.delete.mockRejectedValue(error);
      await service.cleanupExpiredTokens();
      expect(loggerService.error).toHaveBeenCalledWith(
        'Error cleaning up expired tokens',
        error,
      );
    });
  });
});
