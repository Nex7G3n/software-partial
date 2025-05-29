export const TaskStatus = {
	PENDING: 'PENDING',
	IN_PROGRESS: 'IN_PROGRESS',
	COMPLETED: 'COMPLETED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	dueDate?: string; // Assuming it's a string from the backend, can be Date if parsed
	priority?: string;
	completed?: boolean;
	tags?: string[];
	assignedTo?: string;
}

export interface CreateTaskDto {
	title: string;
	description?: string;
	status?: TaskStatus;
}

export interface UpdateTaskDto {
	title?: string;
	description?: string;
	status?: TaskStatus;
}

export interface TaskMetricsDto {
	totalTasks: number;
	tasksByStatus: {
		status: TaskStatus;
		count: number;
	}[];
	tasksByPriority: {
		priority: string; // Assuming priority is a string, adjust if it's an enum
		count: number;
	}[];
	tasksByUser: {
		userId: string;
		userName: string;
		count: number;
	}[];
	timeline: {
		date: string;
		count: number;
	}[];
}
