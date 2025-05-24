import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { LogEntity } from './entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
