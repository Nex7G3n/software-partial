// src/auth/infrastructure/guards/__tests__/jwt-refresh.guard.spec.ts
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	MOCK_VALID_REFRESH_TOKEN,
	mockUserFromAuthService,
	mockRequestWithRefreshToken,
	mockRequestWithoutRefreshToken,
} from '../../__mocks__/jwt-refresh.guard.mocks';
import { JwtRefreshGuard } from 'src/auth/infrastructure/guards/refresh.guard';

describe('JwtRefreshGuard', () => {
	let guard: JwtRefreshGuard;

	// Helper to create ExecutionContext
	const createMockExecutionContext = (request: any): ExecutionContext => {
		return {
			switchToHttp: () => ({
				getRequest: () => request as any, // Use 'any' to allow assigning 'user' property
			}),
			getHandler: jest.fn(),
			getClass: jest.fn(),
		} as unknown as ExecutionContext;
	};

	beforeEach(() => {
		guard = new JwtRefreshGuard();
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

		jest.spyOn(
			AuthGuard('jwt-refresh').prototype,
			'canActivate',
		).mockResolvedValue(true);

		const result = await guard.canActivate(context);

		expect(
			AuthGuard('jwt-refresh').prototype.canActivate,
		).toHaveBeenCalledWith(context);
		expect(result).toBe(true);
		expect(request.user).toEqual(mockUserFromAuthService);
	});

	it('should call super.canActivate and return false if user is not attached', async () => {
		const request = mockRequestWithoutRefreshToken;
		request.user = undefined; // Simulate user not being attached by strategy
		const context = createMockExecutionContext(request);

		jest.spyOn(
			AuthGuard('jwt-refresh').prototype,
			'canActivate',
		).mockResolvedValue(false);

		const result = await guard.canActivate(context);

		expect(
			AuthGuard('jwt-refresh').prototype.canActivate,
		).toHaveBeenCalledWith(context);
		expect(result).toBe(false);
		expect(request.user).toBeUndefined();
	});

	it('should re-throw UnauthorizedException from super.canActivate', async () => {
		const context = createMockExecutionContext(
			mockRequestWithoutRefreshToken,
		);
		jest.spyOn(
			AuthGuard('jwt-refresh').prototype,
			'canActivate',
		).mockRejectedValueOnce(new UnauthorizedException('Test Unauthorized'));

		await expect(guard.canActivate(context)).rejects.toThrow(
			new UnauthorizedException('Test Unauthorized'),
		);
	});
});
