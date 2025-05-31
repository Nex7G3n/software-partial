import { ConfigService } from '@nestjs/config';
import { AuthApplicationService } from 'src/auth/application/services/auth.application.service';

export const mockConfigService: Partial<ConfigService> = {
	get: jest.fn().mockReturnValue('test-refresh-secret'),
};

export const mockAuthApplicationService: Partial<AuthApplicationService> = {
	validateRefreshToken: jest.fn().mockImplementation(),
};