import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { addDays, subDays, format } from 'date-fns';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskStatus } from 'src/tasks/domain/enums/tasks.enum';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskMetricsDto } from '../dtos/task-metrics.dto';

@Injectable()
export class TasksApplicationService {
	constructor(
		@InjectRepository(Task)
		private readonly tasksRepository: Repository<Task>,
	) {}

	async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
		const task = this.tasksRepository.create({
			...createTaskDto,
			userId,
			status: createTaskDto.status || TaskStatus.PENDING,
		});
		const savedTask: Task = await this.tasksRepository.save(task);
		return savedTask;
	}

	async findAllByOwner(userId: string): Promise<Task[]> {
		return this.tasksRepository.find({ where: { userId } });
	}

	async findAllAdmin(): Promise<Task[]> {
		return this.tasksRepository.find();
	}

	async findOneByOwner(id: string, userId: string): Promise<Task> {
		const task = await this.tasksRepository.findOne({
			where: { id, userId },
		});
		if (!task) {
			throw new NotFoundException(
				`Task with ID "${id}" not found or not owned by user.`,
			);
		}
		return task;
	}

	async findOneAdmin(id: string): Promise<Task> {
		const task = await this.tasksRepository.findOne({ where: { id } });
		if (!task) {
			throw new NotFoundException(`Task with ID "${id}" not found.`);
		}
		return task;
	}

	async updateByOwner(
		id: string,
		updateTaskDto: UpdateTaskDto,
		userId: string,
	): Promise<Task> {
		const task = await this.findOneByOwner(id, userId); // Ensures ownership and existence
		this.tasksRepository.merge(task, updateTaskDto);
		return this.tasksRepository.save(task);
	}

	async updateAdmin(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
		const task = await this.findOneAdmin(id); // Ensures existence
		this.tasksRepository.merge(task, updateTaskDto);
		return this.tasksRepository.save(task);
	}

	async removeByOwner(id: string, userId: string): Promise<void> {
		const task = await this.findOneByOwner(id, userId); // Ensures ownership and existence
		await this.tasksRepository.remove(task);
	}

	async removeAdmin(id: string): Promise<void> {
		const task = await this.findOneAdmin(id); // Ensures existence
		await this.tasksRepository.remove(task);
	}

	async getMetrics(userId: string): Promise<TaskMetricsDto> {
		const [tasks, totalTasks] = await this.tasksRepository.findAndCount({
			where: { userId },
		});

		const completedTasks = tasks.filter(
			(task) => task.status === TaskStatus.COMPLETED,
		).length;
		const pendingTasks = totalTasks - completedTasks;

		// Obtener tareas por estado
		const tasksByStatus = await Promise.all(
			Object.values(TaskStatus).map(async (status) => {
				const count = await this.tasksRepository.count({
					where: { userId, status },
				});
				return { status, count };
			}),
		);

		// Obtener tareas por fecha (últimos 7 días)
		const endDate = new Date();
		const startDate = subDays(endDate, 6);
		const tasksByDate: { date: string; count: number }[] = [];

		for (let i = 0; i <= 6; i++) {
			const date = format(addDays(startDate, i), 'yyyy-MM-dd');
			const dayStart = new Date(date);
			const dayEnd = addDays(dayStart, 1);

			const count = await this.tasksRepository.count({
				where: {
					userId,
					createdAt: Between(dayStart, dayEnd),
				},
			});

			tasksByDate.push({ date, count });
		}

		return {
			totalTasks,
			completedTasks,
			pendingTasks,
			tasksByStatus,
			tasksByDate,
		};
	}

	async getMetricsAdmin(): Promise<TaskMetricsDto> {
		const [tasks, totalTasks] = await this.tasksRepository.findAndCount();

		const completedTasks = tasks.filter(
			(task) => task.status === TaskStatus.COMPLETED,
		).length;
		const pendingTasks = totalTasks - completedTasks;

		// Obtener tareas por estado
		const tasksByStatus = await Promise.all(
			Object.values(TaskStatus).map(async (status) => {
				const count = await this.tasksRepository.count({
					where: { status },
				});
				return { status, count };
			}),
		);

		// Obtener tareas por fecha (últimos 7 días)
		const endDate = new Date();
		const startDate = subDays(endDate, 6);
		const tasksByDate: { date: string; count: number }[] = [];

		for (let i = 0; i <= 6; i++) {
			const date = format(addDays(startDate, i), 'yyyy-MM-dd');
			const dayStart = new Date(date);
			const dayEnd = addDays(dayStart, 1);

			const count = await this.tasksRepository.count({
				where: {
					createdAt: Between(dayStart, dayEnd),
				},
			});

			tasksByDate.push({ date, count });
		}

		// Obtener tareas por usuario
		const tasksByUser = await this.tasksRepository
			.createQueryBuilder('task')
			.select(['task.userId as user', 'COUNT(*) as count'])
			.groupBy('task.userId')
			.getRawMany();

		return {
			totalTasks,
			completedTasks,
			pendingTasks,
			tasksByStatus,
			tasksByDate,
			tasksByUser,
		};
	}
}
