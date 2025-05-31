import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { TasksApplicationService } from 'src/tasks/application/services/tasks.application.service';
import { TaskStatus } from 'src/tasks/domain/enums/tasks.enum';
import { CreateTaskDto } from 'src/tasks/application/dtos/create-task.dto';

describe('TasksApplicationService', () => {
	let service: TasksApplicationService;
	let tasksRepository: Repository<Task>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TasksApplicationService,
				{
					provide: getRepositoryToken(Task),
					useClass: Repository, // Use a mock repository class or object
				},
			],
		}).compile();

		service = module.get<TasksApplicationService>(TasksApplicationService);
		tasksRepository = module.get<Repository<Task>>(
			getRepositoryToken(Task),
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a new task', async () => {
			const createTaskDto: CreateTaskDto = {
				title: 'Test Task',
				description: 'This is a test task',
				status: TaskStatus.PENDING,
			};
			const userId = 'test-user-id';
			const expectedTask: Task = {
				id: 'generated-id',
				title: createTaskDto.title,
				description: createTaskDto.description,
				status: createTaskDto.status || TaskStatus.PENDING,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const createSpy = jest
				.spyOn(tasksRepository, 'create')
				.mockReturnValue(expectedTask as any);
			const saveSpy = jest
				.spyOn(tasksRepository, 'save')
				.mockResolvedValue(expectedTask as any);

			const result = await service.create(createTaskDto, userId);

			expect(createSpy).toHaveBeenCalledWith({
				...createTaskDto,
				userId,
				status: createTaskDto.status || TaskStatus.PENDING,
			} as any); // Added 'as any' to satisfy type checking for partial object
			expect(saveSpy).toHaveBeenCalledWith(expectedTask);
			expect(result).toEqual(expectedTask);
		});
	});

	describe('findAllByOwner', () => {
		it('should return an array of tasks for a specific user', async () => {
			const userId = 'test-user-id';
			const expectedTasks: Task[] = [
				{
					id: 'task-1',
					title: 'Task 1',
					userId,
					status: TaskStatus.PENDING,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 'task-2',
					title: 'Task 2',
					userId,
					status: TaskStatus.COMPLETED,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const findSpy = jest
				.spyOn(tasksRepository, 'find')
				.mockResolvedValue(expectedTasks);

			const result = await service.findAllByOwner(userId);

			expect(findSpy).toHaveBeenCalledWith({ where: { userId } });
			expect(result).toEqual(expectedTasks);
		});
	});

	describe('findAllAdmin', () => {
		it('should return an array of all tasks for admin', async () => {
			const expectedTasks: Task[] = [
				{
					id: 'task-1',
					title: 'Task 1',
					userId: 'user-1',
					status: TaskStatus.PENDING,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 'task-2',
					title: 'Task 2',
					userId: 'user-2',
					status: TaskStatus.COMPLETED,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const findSpy = jest
				.spyOn(tasksRepository, 'find')
				.mockResolvedValue(expectedTasks);

			const result = await service.findAllAdmin();

			expect(findSpy).toHaveBeenCalledWith();
			expect(result).toEqual(expectedTasks);
		});
	});

	describe('findOneByOwner', () => {
		it('should return a task if owned by the user', async () => {
			const taskId = 'test-task-id';
			const userId = 'test-user-id';
			const expectedTask: Task = {
				id: taskId,
				title: 'Test Task',
				userId,
				status: TaskStatus.PENDING,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const findOneSpy = jest
				.spyOn(tasksRepository, 'findOne')
				.mockResolvedValue(expectedTask);

			const result = await service.findOneByOwner(taskId, userId);

			expect(findOneSpy).toHaveBeenCalledWith({
				where: { id: taskId, userId },
			});
			expect(result).toEqual(expectedTask);
		});

		it('should throw NotFoundException if task not found for the user', async () => {
			const taskId = 'non-existent-id';
			const userId = 'test-user-id';

			const findOneSpy = jest
				.spyOn(tasksRepository, 'findOne')
				.mockResolvedValue(null);

			await expect(
				service.findOneByOwner(taskId, userId),
			).rejects.toThrow(
				new NotFoundException(
					`Task with ID "${taskId}" not found or not owned by user.`,
				),
			);
			expect(findOneSpy).toHaveBeenCalledWith({
				where: { id: taskId, userId },
			});
		});
	});

	describe('findOneAdmin', () => {
		it('should return a task for admin', async () => {
			const taskId = 'test-task-id';
			const expectedTask: Task = {
				id: taskId,
				title: 'Test Task',
				userId: 'some-user-id',
				status: TaskStatus.PENDING,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const findOneSpy = jest
				.spyOn(tasksRepository, 'findOne')
				.mockResolvedValue(expectedTask);

			const result = await service.findOneAdmin(taskId);

			expect(findOneSpy).toHaveBeenCalledWith({ where: { id: taskId } });
			expect(result).toEqual(expectedTask);
		});

		it('should throw NotFoundException if task not found for admin', async () => {
			const taskId = 'non-existent-id';

			const findOneSpy = jest
				.spyOn(tasksRepository, 'findOne')
				.mockResolvedValue(null);

			await expect(service.findOneAdmin(taskId)).rejects.toThrow(
				new NotFoundException(`Task with ID "${taskId}" not found.`),
			);
			expect(findOneSpy).toHaveBeenCalledWith({ where: { id: taskId } });
		});
	});
});
