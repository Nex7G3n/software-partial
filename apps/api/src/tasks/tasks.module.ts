import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if guards/decorators are not global
import { Task } from './domain/entities/task.entity';
import { TasksController } from './application/controllers/tasks.controller';
import { TasksApplicationService } from './application/services/tasks.application.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Task]),
		AuthModule, // Make sure AuthModule exports JwtAuthGuard and PermissionsGuard or they are global
	],
	controllers: [TasksController],
	providers: [TasksApplicationService],
})
export class TasksModule {}
