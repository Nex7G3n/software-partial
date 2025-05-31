import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './infrastructure/services/logger.service';
import { LogEntity } from './infrastructure/persistence/entities/log.entity';

@Module({
	imports: [TypeOrmModule.forFeature([LogEntity])],
	providers: [LoggerService],
	exports: [LoggerService],
})
export class LoggerModule {}
