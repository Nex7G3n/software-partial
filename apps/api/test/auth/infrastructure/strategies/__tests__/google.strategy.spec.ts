import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import {
	GoogleStrategy,
	GoogleUser,
} from 'src/auth/infrastructure/strategies/google.strategy';
import { mockConfigService, mockProfile } from '../__mocks__/google.strategy.mocks';

describe('GoogleStrategy', () => {
	let strategy: GoogleStrategy;
	let configService: Partial<ConfigService>;

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new GoogleStrategy(configService as ConfigService);
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(strategy).toBeDefined();
		});
	});

	describe('validate', () => {
		it('should return a GoogleUser object when profile contains emails', () => {
			const result: GoogleUser = strategy.validate(
				'access-token',
				'refresh-token',
				mockProfile,
			);

			expect(result).toEqual({
				googleId: '12345',
				email: 'john.doe@example.com',
				name: 'John Doe',
			});
		});

		it('should throw an error if profile has no emails', () => {
			const invalidProfile: Profile = {
				...mockProfile,
				emails: [],
			};

			expect(() =>
				strategy.validate(
					'access-token',
					'refresh-token',
					invalidProfile,
				),
			).toThrow('No email found in Google profile');
		});

		it('should throw an error if emails array is undefined', () => {
			const invalidProfile: any = {
				...mockProfile,
				emails: undefined,
			};

			expect(() =>
				strategy.validate(
					'access-token',
					'refresh-token',
					invalidProfile,
				),
			).toThrow('No email found in Google profile');
		});

		it('should handle missing displayName by returning empty string for name', () => {
			const profileNoName: any = {
				...mockProfile,
				displayName: undefined,
			};

			const result: GoogleUser = strategy.validate(
				'access-token',
				'refresh-token',
				profileNoName,
			);

			expect(result.name).toBe('');
			expect(result.googleId).toBe('12345');
			expect(result.email).toBe('john.doe@example.com');
		});
	});
});
