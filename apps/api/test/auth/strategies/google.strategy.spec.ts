import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { mockConfigService, mockProfile } from './mocks/google.strategy.mocks';
import {
	GoogleStrategy,
	GoogleUser,
} from 'src/auth/infrastructure/strategies/google.strategy';
// import { Request } from 'express'; // No es necesario si passReqToCallback es false

describe('GoogleStrategy', () => {
	let strategy: GoogleStrategy;
	let configService: Partial<ConfigService>;
	let doneMock: jest.Mock;

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new GoogleStrategy(configService as ConfigService);
		doneMock = jest.fn(); // Mock de la función done
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(strategy).toBeDefined();
		});
	});

	describe('validate', () => {
		it('should return a GoogleUser object and call done with the user when profile contains emails', () => {
			const result: GoogleUser = strategy.validate(
				'access-token',
				'refresh-token',
				mockProfile,
				doneMock,
			);

			expect(result).toEqual({
				googleId: '12345',
				email: 'john.doe@example.com',
				name: 'John Doe',
			});
			expect(doneMock).toHaveBeenCalledWith(null, result);
		});

		it('should throw an error if profile is undefined or null', () => {
			expect(() =>
				strategy.validate(
					'access-token',
					'refresh-token',
					undefined as unknown as Profile, // Simular perfil indefinido
					doneMock,
				),
			).toThrow('Google profile is undefined or null');
			expect(doneMock).not.toHaveBeenCalled(); // done no debe ser llamado en caso de error
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
					doneMock,
				),
			).toThrow('No email found in Google profile');
			expect(doneMock).not.toHaveBeenCalled();
		});

		it('should throw an error if emails array is undefined', () => {
			// Crear un perfil donde la propiedad 'emails' no esté presente
			const invalidProfile: Omit<Profile, 'emails'> = {
				id: mockProfile.id,
				displayName: mockProfile.displayName,
				photos: mockProfile.photos,
				provider: mockProfile.provider,
				_raw: mockProfile._raw,
				_json: mockProfile._json,
				profileUrl: mockProfile.profileUrl,
			};

			expect(() =>
				strategy.validate(
					'access-token',
					'refresh-token',
					invalidProfile as Profile,
					doneMock,
				),
			).toThrow('No email found in Google profile');
			expect(doneMock).not.toHaveBeenCalled();
		});

		it('should handle missing displayName by returning empty string for name', () => {
			// Crear un perfil donde la propiedad 'displayName' no esté presente
			const profileNoName: Omit<Profile, 'displayName'> = {
				id: mockProfile.id,
				emails: mockProfile.emails,
				photos: mockProfile.photos,
				provider: mockProfile.provider,
				_raw: mockProfile._raw,
				_json: mockProfile._json,
				profileUrl: mockProfile.profileUrl,
			};

			const result: GoogleUser = strategy.validate(
				'access-token',
				'refresh-token',
				profileNoName as Profile,
				doneMock,
			);

			expect(result.name).toBe('');
			expect(result.googleId).toBe('12345');
			expect(result.email).toBe('john.doe@example.com');
			expect(doneMock).toHaveBeenCalledWith(null, result);
		});
	});
});
