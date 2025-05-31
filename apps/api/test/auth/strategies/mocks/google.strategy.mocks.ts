import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';

export const mockConfigService: Partial<ConfigService> = {
	get: jest.fn((key: string) => {
		switch (key) {
			case 'GOOGLE_CLIENT_ID':
				return 'test-client-id';
			case 'GOOGLE_CLIENT_SECRET':
				return 'test-client-secret';
			case 'GOOGLE_CALLBACK_URL':
				return 'http://localhost/callback';
			default:
				return null;
		}
	}),
};

export const mockProfile: Profile = {
	provider: 'google',
	id: '12345',
	displayName: 'John Doe',
	name: { familyName: 'Doe', givenName: 'John' },
	emails: [{ value: 'john.doe@example.com' }],
	photos: [],
	_raw: '',
	_json: {},
};
