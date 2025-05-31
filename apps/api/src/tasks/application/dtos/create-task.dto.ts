import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsEnum,
	MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from 'src/tasks/domain/enums/tasks.enum';

export class CreateTaskDto {
	@ApiProperty({
		description: 'Título de la tarea',
		example: 'Completar informe trimestral',
		required: true,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@ApiProperty({
		description: 'Descripción detallada de la tarea',
		example: 'El informe debe incluir las métricas del último trimestre',
		required: false,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	description?: string;

	@ApiProperty({
		description: 'Estado de la tarea',
		enum: TaskStatus,
		example: TaskStatus.PENDING,
		required: false,
	})
	@IsEnum(TaskStatus)
	@IsOptional()
	status?: TaskStatus;
}
