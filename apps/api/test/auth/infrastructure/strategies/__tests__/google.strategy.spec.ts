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
	let doneMock: jest.Mock; // Añadido doneMock

	beforeEach(() => {
		configService = mockConfigService;
		strategy = new GoogleStrategy(configService as ConfigService);
		doneMock = jest.fn(); // Inicializado doneMock
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
				doneMock, // Pasado doneMock
			);

			expect(result).toEqual({
				googleId: '12345',
				email: 'john.doe@example.com',
				name: 'John Doe',
			});
			expect(doneMock).toHaveBeenCalledWith(null, result); // Verificado doneMock
		});

		it('should throw an error if profile is undefined or null', () => {
			expect(() =>
				strategy.validate(
					'access-token',
					'refresh-token',
					undefined as unknown as Profile, // Simular perfil indefinido
					doneMock, // Pasado doneMock
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
					doneMock, // Pasado doneMock
				),
			).toThrow('No email found in Google profile');
			expect(doneMock).not.toHaveBeenCalled();
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
					doneMock, // Pasado doneMock
				),
			).toThrow('No email found in Google profile');
			expect(doneMock).not.toHaveBeenCalled();
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
				doneMock, // Pasado doneMock
			);

			expect(result.name).toBe('');
			expect(result.googleId).toBe('12345');
			expect(result.email).toBe('john.doe@example.com');
			expect(doneMock).toHaveBeenCalledWith(null, result); // Verificado doneMock
		});
	});
});
