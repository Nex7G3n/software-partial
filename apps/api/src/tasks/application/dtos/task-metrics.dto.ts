export class TaskMetricsDto {
	totalTasks: number;
	completedTasks: number;
	pendingTasks: number;
	tasksByDate: { date: string; count: number }[];
	tasksByStatus: { status: string; count: number }[];
	tasksByUser?: { user: string; count: number }[];
}
