import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

export const mockConfigService: Partial<ConfigService> = {
	get: jest.fn().mockReturnValue('test-refresh-secret'),
};

export const mockAuthService: Partial<AuthService> = {
	validateRefreshToken: jest.fn(),
};
