import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from 'src/tasks/domain/enums/tasks.enum';

export class UpdateTaskDto {
	@ApiProperty({
		description: 'Título de la tarea',
		example: 'Actualizar informe trimestral',
		required: false,
	})
	@IsString()
	@IsOptional()
	@MaxLength(255)
	title?: string;

	@ApiProperty({
		description: 'Descripción detallada de la tarea',
		example: 'Actualizar las métricas del último trimestre',
		required: false,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	description?: string;

	@ApiProperty({
		description: 'Estado de la tarea',
		enum: TaskStatus,
		example: TaskStatus.IN_PROGRESS,
		required: false,
	})
	@IsEnum(TaskStatus)
	@IsOptional()
	status?: TaskStatus;
}
