import { ConfigService } from '@nestjs/config';

export const mockConfigService: Partial<ConfigService> = {
  get: jest.fn().mockReturnValue('test-secret'),
};
