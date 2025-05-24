import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from './entities/log.entity';

@Injectable()
export class LoggerService extends Logger {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {
    super();
  }

  log(message: any, context?: string) {
    void this.saveLog('log', message, context);
    super.log(message, context);
  }

  error(message: any, trace?: string, context?: string, data?: any) {
    void this.saveLog('error', message, context, data);
    super.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    void this.saveLog('warn', message, context);
    super.warn(message, context);
  }

  debug(message: any, context?: string) {
    void this.saveLog('debug', message, context);
    super.debug(message, context);
  }

  verbose(message: any, context?: string) {
    void this.saveLog('verbose', message, context);
    super.verbose(message, context);
  }

  private async saveLog(
    level: LogLevel,
    message: any,
    context?: string,
    data?: any,
  ) {
    try {
      const log = this.logRepository.create({
        level,
        message:
          typeof message === 'string' ? message : JSON.stringify(message),
        context: data
          ? context
            ? `${context} - ${JSON.stringify(data)}`
            : JSON.stringify(data)
          : context,
      });
      await this.logRepository.save(log);
    } catch (error) {
      super.error('Failed to save log to database', error, 'LoggerService');
    }
  }
}
