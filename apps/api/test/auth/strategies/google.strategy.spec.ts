import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { mockConfigService, mockProfile } from './mocks/google.strategy.mocks';
import {
	GoogleStrategy,
	GoogleUser,
} from 'src/auth/infrastructure/strategies/google.strategy';
import { Request } from 'express';

describe('GoogleStrategy', () => {
	let strategy: GoogleStrategy;
	let configService: Partial<ConfigService>;
	let mockRequest: Partial<Request>;

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new GoogleStrategy(configService as ConfigService);
		mockRequest = {}; // Un objeto Request simulado, puede ser más detallado si es necesario
	});

	describe('constructor', () => {
		it('should be defined', () => {
			expect(strategy).toBeDefined();
		});
	});

	describe('validate', () => {
		it('should return a GoogleUser object when profile contains emails', () => {
			const result: GoogleUser = strategy.validate(
				mockRequest as Request,
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
					mockRequest as Request,
					'access-token',
					'refresh-token',
					invalidProfile,
				),
			).toThrow('No email found in Google profile');
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
				profileUrl: mockProfile.profileUrl, // Añadir profileUrl
			};

			expect(() =>
				strategy.validate(
					mockRequest as Request,
					'access-token',
					'refresh-token',
					invalidProfile as Profile, // Castear a Profile para que coincida con la firma del método
				),
			).toThrow('No email found in Google profile');
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
				mockRequest as Request,
				'access-token',
				'refresh-token',
				profileNoName as Profile, // Castear a Profile para que coincida con la firma del método
			);

			expect(result.name).toBe('');
			expect(result.googleId).toBe('12345');
			expect(result.email).toBe('john.doe@example.com');
		});
	});
});
