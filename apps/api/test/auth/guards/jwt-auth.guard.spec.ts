import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport'; // Added AuthGuard import
import { Test, TestingModule } from '@nestjs/testing';

import {
	MOCK_VALID_JWT_TOKEN,
	MOCK_JWT_SECRET,
	mockJwtPayloadStrict as mockJwtPayload,
	mockRequestWithValidToken,
	mockRequestWithoutToken,
	mockRequestWithNonBearerToken,
} from './mocks/jwt-auth.guard.mocks';

import { User } from 'src/common/types/user.interface';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/infrastructure/strategies/jwt.strategy';
import { Role } from 'src/auth/domain/enums/role.enum';
import { ConfigService } from '@nestjs/config';

describe('JwtAuthGuard', () => {
	let guard: JwtAuthGuard;
	let mockJwtService: jest.Mocked<JwtService>;
	let mockConfigService: jest.Mocked<ConfigService>;
	// Removed superCanActivateSpy: jest.SpyInstance;

	const createMockExecutionContext = (request: unknown): ExecutionContext => {
		return {
			switchToHttp: () => ({
				getRequest: () => request,
				getResponse: jest.fn(),
			}),
			getClass: jest.fn(),
			getHandler: jest.fn(),
		} as unknown as ExecutionContext;
	};

	beforeEach(async () => {
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

		const mockJwtStrategy = {
			validate: jest.fn().mockResolvedValue(true),
		};

		const module: TestingModule = await Test.createTestingModule({
			imports: [PassportModule],
			providers: [
				JwtAuthGuard,
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: JwtStrategy, useValue: mockJwtStrategy },
			],
		}).compile();

		guard = module.get<JwtAuthGuard>(JwtAuthGuard);
		// Spy on the AuthGuard('jwt') prototype's canActivate method
		// This ensures that super.canActivate in JwtAuthGuard is mocked
		jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockResolvedValue(
			false,
		);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should allow access if super.canActivate returns true', async () => {
		// Temporarily mock the AuthGuard('jwt') prototype's canActivate for this specific test
		jest.spyOn(
			AuthGuard('jwt').prototype,
			'canActivate',
		).mockResolvedValueOnce(true);
		const mockRequest = {};
		const context = createMockExecutionContext(mockRequest);

		const result = await guard.canActivate(context);

		expect(result).toBe(true);
		expect(mockJwtService.verify.mock.calls).toHaveLength(0);
	});

	describe('when super.canActivate returns false (custom logic)', () => {
		it('should deny access if no token is provided', async () => {
			const context = createMockExecutionContext(mockRequestWithoutToken);
			const result = await guard.canActivate(context);

			expect(result).toBe(false);
			expect(mockJwtService.verify.mock.calls).toHaveLength(0);
		});

		it('should deny access if token is not a Bearer token', async () => {
			const context = createMockExecutionContext(
				mockRequestWithNonBearerToken,
			);
			const result = await guard.canActivate(context);

			expect(result).toBe(false);
			expect(mockJwtService.verify.mock.calls).toHaveLength(0);
		});

		it('should allow access and attach user to request if token is valid', async () => {
			mockJwtService.verify.mockReturnValue(mockJwtPayload);
			const request = mockRequestWithValidToken();
			const context = createMockExecutionContext(request);

			mockConfigService.get.mockImplementation((key: string) => {
				if (key === 'JWT_SECRET') {
					return MOCK_JWT_SECRET;
				}
				return undefined;
			});

			const result = await guard.canActivate(context);

			expect(result).toBe(true);
			expect(mockJwtService.verify).toHaveBeenCalledWith(
				MOCK_VALID_JWT_TOKEN,
				{
					secret: MOCK_JWT_SECRET,
				},
			);

			const expectedUser: User = {
				id: mockJwtPayload.sub,
				email: mockJwtPayload.email,
				name: mockJwtPayload.name,
				roles: [Role.USER, Role.EDITOR],
			};
			expect(request.user).toEqual(expectedUser);
		});
	});
});
