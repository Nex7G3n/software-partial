import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { LoggerService } from 'src/logger/infrastructure/services/logger.service';
import { LogEntity } from 'src/logger/infrastructure/persistence/entities/log.entity';

describe('LoggerService', () => {
	let service: LoggerService;

	const mockLogRepository = {
		create: jest.fn(),
		save: jest.fn(),
	};

	const mockSuperLogger = {
		log: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		debug: jest.fn(),
		verbose: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LoggerService,
				{
					provide: getRepositoryToken(LogEntity),
					useValue: mockLogRepository,
				},
				{
					provide: Logger,
					useValue: mockSuperLogger,
				},
			],
		}).compile();

		service = module.get<LoggerService>(LoggerService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('log', () => {
		it('should call saveLog', () => {
			// Access the private method using type assertion
			type LoggerServiceWithPrivate = typeof service & {
				saveLog: (
					level: string,
					message: string | object,
					context?: string,
					data?: object,
				) => Promise<void>;
			};
			const saveLogSpy = jest.spyOn(
				service as LoggerServiceWithPrivate,
				'saveLog',
			);
			const message = 'Test log message';
			const context = 'TestContext';

			service.log(message, context);

			expect(saveLogSpy).toHaveBeenCalledWith('log', message, context);
		});
	});

	describe('error', () => {
		it('should call saveLog', () => {
			// Access the private method using type assertion
			type LoggerServiceWithPrivate = typeof service & {
				saveLog: (
					level: string,
					message: string | object,
					context?: string,
					data?: object,
				) => Promise<void>;
			};
			const saveLogSpy = jest.spyOn(
				service as LoggerServiceWithPrivate,
				'saveLog',
			);
			const message = 'Test error message';
			const trace = 'TestTrace';
			const context = 'TestContext';
			const data = { key: 'value' };

			service.error(message, trace, context, data);

			expect(saveLogSpy).toHaveBeenCalledWith(
				'error',
				message,
				context,
				data,
			);
		});
	});

	describe('warn', () => {
		it('should call saveLog', () => {
			// Access the private method using type assertion
			type LoggerServiceWithPrivate = typeof service & {
				saveLog: (
					level: string,
					message: string | object,
					context?: string,
					data?: object,
				) => Promise<void>;
			};
			const saveLogSpy = jest.spyOn(
				service as LoggerServiceWithPrivate,
				'saveLog',
			);
			const message = 'Test warn message';
			const context = 'TestContext';

			service.warn(message, context);

			expect(saveLogSpy).toHaveBeenCalledWith('warn', message, context);
		});
	});

	describe('debug', () => {
		it('should call saveLog', () => {
			// Access the private method using type assertion
			type LoggerServiceWithPrivate = typeof service & {
				saveLog: (
					level: string,
					message: string | object,
					context?: string,
					data?: object,
				) => Promise<void>;
			};
			const saveLogSpy = jest.spyOn(
				service as LoggerServiceWithPrivate,
				'saveLog',
			);
			const message = 'Test debug message';
			const context = 'TestContext';

			service.debug(message, context);

			expect(saveLogSpy).toHaveBeenCalledWith('debug', message, context);
		});
	});

	describe('verbose', () => {
		it('should call saveLog', () => {
			// Access the private method using type assertion
			type LoggerServiceWithPrivate = typeof service & {
				saveLog: (
					level: string,
					message: string | object,
					context?: string,
					data?: object,
				) => Promise<void>;
			};
			const saveLogSpy = jest.spyOn(
				service as LoggerServiceWithPrivate,
				'saveLog',
			);
			const message = 'Test verbose message';
			const context = 'TestContext';

			service.verbose(message, context);

			expect(saveLogSpy).toHaveBeenCalledWith(
				'verbose',
				message,
				context,
			);
		});
	});

	describe('saveLog', () => {
		it('should create and save a log entity', async () => {
			const level = 'log';
			const message = 'Test message';
			const context = 'TestContext';
			const data = { key: 'value' };

			mockLogRepository.create.mockReturnValue({});
			mockLogRepository.save.mockResolvedValue({});

			await (
				service as LoggerService & {
					saveLog: (
						level: string,
						message: string | object,
						context?: string,
						data?: object,
					) => Promise<void>;
				}
			).saveLog(level, message, context, data);

			expect(mockLogRepository.create).toHaveBeenCalledWith({
				level,
				message,
				context: `${context} - ${JSON.stringify(data)}`,
			});
			expect(mockLogRepository.save).toHaveBeenCalledWith({});
		});

		it('should handle message as object', async () => {
			const level = 'log';
			const message = { key: 'value' };
			const context = 'TestContext';

			mockLogRepository.create.mockReturnValue({});
			mockLogRepository.save.mockResolvedValue({});

			await (service as LoggerServiceWithPrivate).saveLog(
				level,
				message,
				context,
			);

			expect(mockLogRepository.create).toHaveBeenCalledWith({
				level,
				message: JSON.stringify(message),
				context,
			});
			expect(mockLogRepository.save).toHaveBeenCalledWith({});
		});

		it('should handle context with data but no initial context', async () => {
			const level = 'log';
			const message = 'Test message';
			const data = { key: 'value' };

			mockLogRepository.create.mockReturnValue({});
			mockLogRepository.save.mockResolvedValue({});

			await (service as LoggerServiceWithPrivate).saveLog(
				level,
				message,
				undefined,
				data,
			);

			expect(mockLogRepository.create).toHaveBeenCalledWith({
				level,
				message,
				context: JSON.stringify(data),
			});
			expect(mockLogRepository.save).toHaveBeenCalledWith({});
		});
	});
});
