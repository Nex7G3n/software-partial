import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { JwtRefreshStrategy } from 'src/auth/infrastructure/strategies/jwt-refresh.strategy';
import { AuthApplicationService } from 'src/auth/application/services/auth.application.service';
import { mockConfigService } from '../../__mocks__/jwt-refresh.strategy.mocks';
import { mockAuthApplicationService } from '../../__mocks__/jwt-refresh.strategy.mocks';

describe('JwtRefreshStrategy', () => {
	let strategy: JwtRefreshStrategy;
	let configService: Partial<ConfigService>;
	let authService: Partial<AuthApplicationService>;

	beforeEach(() => {
		configService = mockConfigService;
		authService = mockAuthApplicationService;
		strategy = new JwtRefreshStrategy(
			configService as ConfigService,
			authService as AuthApplicationService,
		);
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(strategy).toBeDefined();
		});

		it('should have correct name', () => {
			expect(strategy.name).toBe('jwt');
		});
	});

	describe('validate', () => {
		const mockUser = { id: 1, username: 'testuser' };

		it('should throw UnauthorizedException if no refresh token in cookies or body', async () => {
			const req = { cookies: {}, body: {} } as unknown as Request;
			await expect(strategy.validate(req)).rejects.toThrow(
				UnauthorizedException,
			);
			await expect(strategy.validate(req)).rejects.toThrow(
				'Refresh token not found',
			);
		});

		it('should throw UnauthorizedException if refresh token is invalid', async () => {
			(authService.validateRefreshToken as jest.Mock).mockResolvedValue(
				null,
			);
			const req = {
				cookies: { refresh_token: 'invalid-token' },
				body: {},
			} as unknown as Request;
			await expect(strategy.validate(req)).rejects.toThrow(
				UnauthorizedException,
			);
			await expect(strategy.validate(req)).rejects.toThrow(
				'Invalid refresh token',
			);
		});

		it('should return user if refresh token is valid (from cookie)', async () => {
			(authService.validateRefreshToken as jest.Mock).mockResolvedValue(
				mockUser,
			);
			const req = {
				cookies: { refresh_token: 'valid-token' },
				body: {},
			} as unknown as Request;
			const result = await strategy.validate(req);
			expect(result).toBe(mockUser);
			expect(authService.validateRefreshToken).toHaveBeenCalledWith(
				'valid-token',
			);
		});

		it('should return user if refresh token is valid (from body)', async () => {
			(authService.validateRefreshToken as jest.Mock).mockResolvedValue(
				mockUser,
			);
			const req = {
				cookies: {},
				body: { refreshToken: 'body-token' },
			} as any as Request;
			const result = await strategy.validate(req);
			expect(result).toBe(mockUser);
			expect(authService.validateRefreshToken).toHaveBeenCalledWith(
				'body-token',
			);
		});
	});
});
