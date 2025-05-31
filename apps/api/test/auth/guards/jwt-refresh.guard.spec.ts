// src/auth/infrastructure/guards/__tests__/jwt-refresh.guard.spec.ts
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshGuard } from 'src/auth/infrastructure/guards/refresh.guard';
import { JwtRefreshStrategy } from 'src/auth/infrastructure/strategies/jwt-refresh.strategy';
import { Request } from 'express';
import { User } from 'src/common/types/user.interface';
import {
	MOCK_VALID_REFRESH_TOKEN,
	mockRequestWithoutRefreshToken,
	mockRequestWithRefreshToken,
	mockUserFromAuthService,
} from './mocks/jwt-refresh.guard.mocks';

describe('JwtRefreshGuard', () => {
	let guard: JwtRefreshGuard;
	let superCanActivateSpy: jest.SpyInstance;

	// Helper to create ExecutionContext
	const createMockExecutionContext = (
		request: Partial<Request> & { user?: User },
	): ExecutionContext => {
		return {
			switchToHttp: () => ({
				getRequest: () => request,
				getResponse: jest.fn(),
			}),
			getHandler: jest.fn(),
			getClass: jest.fn(),
		} as unknown as ExecutionContext;
	};

	beforeEach(async () => {
		// Mock JwtRefreshStrategy to avoid actual Passport strategy logic during testing
		const mockJwtRefreshStrategy = {
			validate: jest.fn().mockResolvedValue(true), // Mock validate to always return true for simplicity
		};

		const module: TestingModule = await Test.createTestingModule({
			imports: [PassportModule], // Import PassportModule
			providers: [
				JwtRefreshGuard,
				// Provide a mock for JwtRefreshStrategy
				{
					provide: JwtRefreshStrategy,
					useValue: mockJwtRefreshStrategy,
				},
			],
		}).compile();

		guard = module.get<JwtRefreshGuard>(JwtRefreshGuard);

		// Spy on the actual AuthGuard's canActivate method
		// We need to get the instance from the testing module to ensure it's properly initialized with the strategy
		superCanActivateSpy = jest.spyOn(guard, 'canActivate');
		superCanActivateSpy.mockResolvedValue(false); // Default mock for super.canActivate
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should call super.canActivate and return true if user is attached', async () => {
		const request = mockRequestWithRefreshToken(MOCK_VALID_REFRESH_TOKEN);
		request.user = mockUserFromAuthService; // Simulate user being attached by strategy
		const context = createMockExecutionContext(request);

		// Mock canActivate to simulate super.canActivate returning true and attaching user
		superCanActivateSpy.mockImplementation(
			async (ctx: ExecutionContext) => {
				const req = ctx.switchToHttp().getRequest<Request>();
				req.user = mockUserFromAuthService;
				return true;
			},
		);

		const result = await guard.canActivate(context);

		expect(superCanActivateSpy).toHaveBeenCalledWith(context);
		expect(result).toBe(true);
		expect(request.user).toEqual(mockUserFromAuthService);
	});

	it('should call super.canActivate and return false if user is not attached', async () => {
		const request = mockRequestWithoutRefreshToken;
		request.user = undefined; // Simulate user not being attached by strategy
		const context = createMockExecutionContext(request);

		// Mock canActivate to simulate super.canActivate returning false and not attaching user
		superCanActivateSpy.mockImplementation(
			async (ctx: ExecutionContext) => {
				const req = ctx.switchToHttp().getRequest<Request>();
				req.user = undefined;
				return false;
			},
		);

		const result = await guard.canActivate(context);

		expect(superCanActivateSpy).toHaveBeenCalledWith(context);
		expect(result).toBe(false);
		expect(request.user).toBeUndefined();
	});

	it('should re-throw UnauthorizedException from super.canActivate', async () => {
		const context = createMockExecutionContext(
			mockRequestWithoutRefreshToken,
		);
		// Mock canActivate to simulate super.canActivate throwing an UnauthorizedException
		superCanActivateSpy.mockImplementation(async () => {
			throw new UnauthorizedException('Test Unauthorized');
		});

		await expect(guard.canActivate(context)).rejects.toThrow(
			new UnauthorizedException('Test Unauthorized'),
		);
	});
});
