export enum TaskStatus {
	PENDING = 'PENDING',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateTaskDto {
	title: string;
	description?: string;
	status?: TaskStatus;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface TaskState {
	tasks: Task[];
	selectedTask: Task | null;
	loadingFetch: boolean;
	error: string | null;
	searchTerm: string;
	filteredTasks: Task[];

	fetchTasks: () => Promise<void>;
	selectTask: (task: Task | null) => void;
	fetchTaskById: (id: string) => Promise<void>;
	createTask: (data: CreateTaskDto) => Promise<void>;
	updateTask: (id: string, data: UpdateTaskDto) => Promise<void>;
	deleteTask: (id: string) => Promise<void>;
	setSearchTerm: (term: string) => void;
	fetchAdminTasks: () => Promise<void>;
	resetError: () => void;
	logout: () => Promise<void>;
	saveAccessTokenFromUrl: () => Promise<void>;
}

export interface TaskMetricsDto {
	totalTasks: number;
	completedTasks: number;
	pendingTasks: number;
	tasksByDate: { date: string; count: number }[];
	tasksByStatus: { status: string; count: number }[];
	tasksByUser?: { user: string; count: number }[];
}
