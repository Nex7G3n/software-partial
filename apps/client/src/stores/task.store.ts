import { create } from 'zustand';
import type {
	Task,
	CreateTaskDto,
	UpdateTaskDto,
	TaskMetricsDto,
} from '../types/tasks.interface';
import { toast } from 'sonner';
import { taskService } from '../services/task.service';
import { AxiosError } from 'axios';

interface TaskState {
	tasks: Task[];
	selectedTask: Task | null;
	loadingFetch: boolean;
	error: string | null;
	searchTerm: string;
	filteredTasks: Task[];
	isAdminMode: boolean;
	metrics: TaskMetricsDto | null;

	fetchTasks: () => Promise<void>;
	selectTask: (task: Task | null) => void;
	fetchTaskById: (id: string) => Promise<void>;
	createTask: (data: CreateTaskDto) => Promise<void>;
	updateTask: (id: string, data: UpdateTaskDto) => Promise<void>;
	deleteTask: (id: string) => Promise<void>;
	setSearchTerm: (term: string) => void;
	setAdminMode: (isAdmin: boolean) => void;
	fetchAdminTasks: () => Promise<void>;
	fetchTaskByIdAdmin: (id: string) => Promise<void>;
	updateTaskAdmin: (id: string, data: UpdateTaskDto) => Promise<void>;
	deleteTaskAdmin: (id: string) => Promise<void>;

	// New service methods
	fetchMetrics: () => Promise<TaskMetricsDto>;
	fetchMetricsAdmin: () => Promise<TaskMetricsDto>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
	tasks: [],
	selectedTask: null,
	loadingFetch: false,
	error: null,
	searchTerm: '',
	filteredTasks: [],
	isAdminMode: false,
	metrics: null,

	fetchTasks: async () => {
		set({ loadingFetch: true, error: null });
		try {
			const tasks = await taskService.getAll();
			set({ tasks, filteredTasks: tasks });
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(`Error al cargar tareas: ${err.message}`);
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},

	selectTask: (task) => set({ selectedTask: task }),

	fetchTaskById: async (id) => {
		set({ loadingFetch: true, error: null });
		try {
			const task = await taskService.getById(id, get().isAdminMode);
			set({ selectedTask: task });
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(`Error al cargar tarea: ${err.message}`);
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},

	createTask: async (data) => {
		const tempId = `temp-${Date.now()}`;
		const optimisticTask: Task = { ...data, id: tempId } as Task;
		const prevTasks = get().tasks;
		const prevFiltered = get().filteredTasks;
		const { searchTerm } = get();

		set({ tasks: [...prevTasks, optimisticTask] });

		if (
			!searchTerm.trim() ||
			data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(data.description
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ??
				false)
		) {
			set({ filteredTasks: [...prevFiltered, optimisticTask] });
		}

		const promise = taskService
			.create(data)
			.then((newTask) => {
				const updatedTasks = get().tasks.map((t) =>
					t.id === tempId ? newTask : t,
				);
				set({ tasks: updatedTasks });

				if (get().filteredTasks.some((t) => t.id === tempId)) {
					set({
						filteredTasks: get().filteredTasks.map((t) =>
							t.id === tempId ? newTask : t,
						),
					});
				}
				return newTask;
			})
			.catch((err: unknown) => {
				if (err instanceof AxiosError) {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						error: err.message,
					});
					throw err;
				} else {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						error: 'An unknown error occurred',
					});
					throw new Error('An unknown error occurred');
				}
			});

		toast.promise(promise, {
			loading: 'Agregando tarea...',
			success: (data: Task) =>
				`${data.title} ha sido agregada correctamente.`,
			error: 'No se pudo agregar la tarea.',
		});
	},

	updateTask: async (id, data) => {
		const prevTasks = get().tasks;
		const prevFiltered = get().filteredTasks;
		const prevSelected = get().selectedTask;
		const { searchTerm, isAdminMode } = get();
		const existingTask = prevTasks.find((t) => t.id === id);
		if (!existingTask) return;

		const updatedTask = {
			...existingTask,
			...data,
		} as Task;

		set({
			tasks: prevTasks.map((t) => (t.id === id ? updatedTask : t)),
		});

		const taskInFiltered = prevFiltered.some((t) => t.id === id);
		const matchesSearch =
			!searchTerm.trim() ||
			updatedTask.title
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			(updatedTask.description
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ??
				false);

		if (taskInFiltered && matchesSearch) {
			set({
				filteredTasks: prevFiltered.map((t) =>
					t.id === id ? updatedTask : t,
				),
			});
		} else if (taskInFiltered && !matchesSearch) {
			set({
				filteredTasks: prevFiltered.filter((t) => t.id !== id),
			});
		} else if (!taskInFiltered && matchesSearch) {
			set({
				filteredTasks: [...prevFiltered, updatedTask],
			});
		}

		if (prevSelected?.id === id) {
			set({ selectedTask: updatedTask });
		}

		const promise = taskService
			.update(id, data, isAdminMode)
			.then((updated) => {
				set({
					tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
				});

				if (get().filteredTasks.some((t) => t.id === id)) {
					set({
						filteredTasks: get().filteredTasks.map((t) =>
							t.id === id ? updated : t,
						),
					});
				}

				if (get().selectedTask?.id === id) {
					set({ selectedTask: updated });
				}
				return updated;
			})
			.catch((err: unknown) => {
				if (err instanceof AxiosError) {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						selectedTask: prevSelected,
						error: err.message,
					});
					throw err;
				} else {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						selectedTask: prevSelected,
						error: 'An unknown error occurred',
					});
					throw new Error('An unknown error occurred');
				}
			});

		toast.promise(promise, {
			loading: 'Actualizando tarea...',
			success: (data: Task) => `${data.title} ha sido actualizada.`,
			error: 'No se pudo actualizar la tarea.',
		});
	},

	deleteTask: async (id) => {
		const prevTasks = get().tasks;
		const prevFiltered = get().filteredTasks;
		const prevSelected = get().selectedTask;
		const { isAdminMode } = get();

		set({
			tasks: prevTasks.filter((t) => t.id !== id),
			filteredTasks: prevFiltered.filter((t) => t.id !== id),
		});

		if (prevSelected?.id === id) {
			set({ selectedTask: null });
		}

		const promise = taskService
			.remove(id, isAdminMode)
			.then(() => {
				return { id };
			})
			.catch((err: unknown) => {
				if (err instanceof AxiosError) {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						selectedTask: prevSelected,
						error: err.message,
					});
					throw err;
				} else {
					set({
						tasks: prevTasks,
						filteredTasks: prevFiltered,
						selectedTask: prevSelected,
						error: 'An unknown error occurred',
					});
					throw new Error('An unknown error occurred');
				}
			});

		toast.promise(promise, {
			loading: 'Eliminando tarea...',
			success: () => `Tarea eliminada correctamente.`,
			error: 'No se pudo eliminar la tarea.',
		});
	},

	setSearchTerm: (term) => {
		set({ searchTerm: term });
		const { tasks } = get();

		if (!term.trim()) {
			set({ filteredTasks: tasks });
			return;
		}

		const searchTermLower = term.toLowerCase();
		const filtered = tasks.filter(
			(task) =>
				task.title.toLowerCase().includes(searchTermLower) ||
				(task.description?.toLowerCase().includes(searchTermLower) ??
					false),
		);

		set({ filteredTasks: filtered });
	},

	setAdminMode: (isAdmin) => {
		set({ isAdminMode: isAdmin });
		if (isAdmin) {
			get().fetchAdminTasks();
		} else {
			get().fetchTasks();
		}
	},

	fetchAdminTasks: async () => {
		set({ loadingFetch: true, error: null });
		try {
			const tasks = await taskService.getAllAdmin();
			set({ tasks, filteredTasks: tasks });
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(
					`Error al cargar tareas de administrador: ${err.message}`,
				);
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},

	fetchTaskByIdAdmin: async (id) => {
		set({ loadingFetch: true, error: null });
		try {
			const task = await taskService.getById(id, true);
			set({ selectedTask: task });
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(
					`Error al cargar tarea de administrador: ${err.message}`,
				);
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},

	updateTaskAdmin: async (id, data) => {
		const prevIsAdminMode = get().isAdminMode;
		set({ isAdminMode: true });
		await get().updateTask(id, data);
		set({ isAdminMode: prevIsAdminMode });
	},

	deleteTaskAdmin: async (id) => {
		const prevIsAdminMode = get().isAdminMode;
		set({ isAdminMode: true });
		await get().deleteTask(id);
		set({ isAdminMode: prevIsAdminMode });
	},

	// New methods for fetching metrics
	fetchMetrics: async () => {
		set({ loadingFetch: true, error: null });
		try {
			const metrics = await taskService.getMetrics();
			set({ metrics });
			return metrics;
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(`Error al obtener métricas: ${err.message}`);
				throw err;
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
				throw new Error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},

	fetchMetricsAdmin: async () => {
		set({ loadingFetch: true, error: null });
		try {
			const metrics = await taskService.getMetricsAdmin();
			set({ metrics });
			return metrics;
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				set({ error: err.message });
				toast.error(
					`Error al obtener métricas de administrador: ${err.message}`,
				);
				throw err;
			} else {
				set({ error: 'An unknown error occurred' });
				toast.error('An unknown error occurred');
				throw new Error('An unknown error occurred');
			}
		} finally {
			set({ loadingFetch: false });
		}
	},
}));

// Exportación de los selectores y acciones para uso en componentes
export const selectTasks = (state: TaskState) => state.tasks;
export const selectFilteredTasks = (state: TaskState) => state.filteredTasks;
export const selectSelectedTask = (state: TaskState) => state.selectedTask;
export const selectIsLoading = (state: TaskState) => state.loadingFetch;
export const selectError = (state: TaskState) => state.error;
export const selectSearchTerm = (state: TaskState) => state.searchTerm;
export const selectIsAdminMode = (state: TaskState) => state.isAdminMode;
export const selectMetrics = (state: TaskState) => state.metrics;
