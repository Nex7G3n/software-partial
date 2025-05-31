import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { mockConfigService, mockProfile } from './mocks/google.strategy.mocks';
import {
	GoogleStrategy,
	GoogleUser,
} from 'src/auth/infrastructure/strategies/google.strategy';

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
			const invalidProfile: Partial<Profile> = {
				id: mockProfile.id,
				displayName: mockProfile.displayName,
				photos: mockProfile.photos,
				provider: mockProfile.provider,
				_raw: mockProfile._raw,
				_json: mockProfile._json,
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
			const profileNoName: Profile = {
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
