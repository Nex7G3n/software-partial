import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { mockConfigService } from './mocks/jwt.strategy.mocks';
import { JwtStrategy } from 'src/auth/infrastructure/strategies/jwt.strategy';

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;
	let configService: Partial<ConfigService>;

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new JwtStrategy(configService as ConfigService);
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
		it('should return user object including roles array when roles are provided', () => {
			const payload: JwtPayload = {
				sub: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				roles: ['admin', 'user'],
			} as JwtPayload;

			const result = strategy.validate(payload);
			expect(result).toEqual({
				id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				roles: ['admin', 'user'],
			});
		});

		it('should return user object with empty roles array when roles is not an array', () => {
			const payload: any = {
				sub: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				roles: 'not-an-array',
			};

			const result = strategy.validate(payload);
			expect(result).toEqual({
				id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				roles: [],
			});
		});

		it('should return user object with empty roles array when roles is undefined', () => {
			const payload: any = {
				sub: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
			};

			const result = strategy.validate(payload);
			expect(result).toEqual({
				id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				roles: [],
			});
		});
	});
});
