import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { LoggerModule } from './logger/logger.module';
import { RefreshToken } from './auth/domain/entities/refresh-token.entity';
import { Task } from './tasks/domain/entities/task.entity';
import { UserEntity } from './auth/domain/entities/user.entity';
import { LogEntity } from './logger/infrastructure/persistence/entities/log.entity';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST || 'localhost',
			port: parseInt(process.env.DB_PORT || '5432', 10),
			username: process.env.DB_USER || 'default_user',
			password: process.env.DB_PASSWORD || 'default_password',
			database: process.env.DB_NAME || 'default_database',
			entities: [RefreshToken, Task, UserEntity, LogEntity],
			synchronize: true,
			logging: true,
			ssl: {
				rejectUnauthorized: false,
			},
		}),
		AuthModule,
		TasksModule,
		LoggerModule,
	],
})
export class AppModule {}
