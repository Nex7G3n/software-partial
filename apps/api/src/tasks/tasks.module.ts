import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if guards/decorators are not global

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AuthModule, // Make sure AuthModule exports JwtAuthGuard and PermissionsGuard or they are global
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
