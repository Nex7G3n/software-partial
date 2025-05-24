import api from '../lib/axios';
import {
	Task,
	CreateTaskDto,
	UpdateTaskDto,
	TaskMetricsDto,
} from '../types/tasks.interface';

const API_BASE = '/tasks';

export const taskService = {
	async getAll(): Promise<Task[]> {
		const response = await api.get<Task[]>(API_BASE);
		return response.data;
	},

	async getAllAdmin(): Promise<Task[]> {
		const response = await api.get<Task[]>(`${API_BASE}/all`);
		return response.data;
	},

	async getById(id: string, isAdmin = false): Promise<Task> {
		const endpoint = isAdmin
			? `${API_BASE}/admin/${id}`
			: `${API_BASE}/${id}`;
		const response = await api.get<Task>(endpoint);
		return response.data;
	},

	async create(data: CreateTaskDto): Promise<Task> {
		const response = await api.post<Task>(API_BASE, data);
		return response.data;
	},

	async update(
		id: string,
		data: UpdateTaskDto,
		isAdmin = false,
	): Promise<Task> {
		const endpoint = isAdmin
			? `${API_BASE}/admin/${id}`
			: `${API_BASE}/${id}`;
		const response = await api.patch<Task>(endpoint, data);
		return response.data;
	},

	async remove(id: string, isAdmin = false): Promise<void> {
		const endpoint = isAdmin
			? `${API_BASE}/admin/${id}`
			: `${API_BASE}/${id}`;
		await api.delete(endpoint);
	},

	async getMetrics(): Promise<TaskMetricsDto> {
		const response = await api.get<TaskMetricsDto>(`${API_BASE}/metrics`);
		return response.data;
	},

	async getMetricsAdmin(): Promise<TaskMetricsDto> {
		const response = await api.get<TaskMetricsDto>(
			`${API_BASE}/metrics/admin`,
		);
		return response.data;
	},
};
