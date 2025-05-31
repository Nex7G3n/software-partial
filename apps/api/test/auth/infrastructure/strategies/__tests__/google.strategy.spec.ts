import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import {
	GoogleStrategy,
	GoogleUser,
} from 'src/auth/infrastructure/strategies/google.strategy';
import {
	mockConfigService,
	mockProfile,
} from 'test/auth/strategies/mocks/google.strategy.mocks';

describe('GoogleStrategy', () => {
	let strategy: GoogleStrategy;
	let configService: Partial<ConfigService>;
	let doneMock: jest.Mock;

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new GoogleStrategy(configService as ConfigService);
		doneMock = jest.fn();
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(strategy).toBeDefined();
		});
	});

	describe('validate', () => {
		// Función auxiliar para reducir la duplicación
		const callValidate = (profile: Profile) => {
			return strategy.validate(
				'access-token',
				'refresh-token',
				profile,
				doneMock,
			);
		};

		it('should return a GoogleUser object and call done with the user when profile contains emails', () => {
			const result: GoogleUser = callValidate(mockProfile);

			expect(result).toEqual({
				googleId: '12345',
				email: 'john.doe@example.com',
				name: 'John Doe',
			});
			expect(doneMock).toHaveBeenCalledWith(null, result);
		});

		it('should throw an error if profile is undefined or null', () => {
			expect(() => callValidate(undefined as unknown as Profile)).toThrow(
				'Google profile is undefined or null',
			);
			expect(doneMock).not.toHaveBeenCalled();
		});

		it('should throw an error if profile has no emails', () => {
			const invalidProfile: Profile = {
				...mockProfile,
				emails: [],
			};

			expect(() => callValidate(invalidProfile)).toThrow(
				'No email found in Google profile',
			);
			expect(doneMock).not.toHaveBeenCalled();
		});

		it('should throw an error if emails array is undefined', () => {
			const invalidProfile: any = {
				...mockProfile,
				emails: undefined,
			};

			expect(() => callValidate(invalidProfile)).toThrow(
				'No email found in Google profile',
			);
			expect(doneMock).not.toHaveBeenCalled();
		});

		it('should handle missing displayName by returning empty string for name', () => {
			const profileNoName: any = {
				...mockProfile,
				displayName: undefined,
			};

			const result: GoogleUser = callValidate(profileNoName);

			expect(result.name).toBe('');
			expect(result.googleId).toBe('12345');
			expect(result.email).toBe('john.doe@example.com');
			expect(doneMock).toHaveBeenCalledWith(null, result);
		});
	});
});
