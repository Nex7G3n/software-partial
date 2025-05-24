import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskStore } from '../../stores/task.store';
import { TaskSortableSkeleton } from './records/task.skeleton';
import { Button } from '../components/Button';
import { TaskDialogWrapper } from './dialogs/task.dialog.wrapper';
import SearchBar from '../components/SearchBar';
import { useUserStore } from '../../stores/user.store';
import { Permission } from '../../types/permission.enum';
import { TaskList } from './records/task.list';
import { useDialogStore } from '../../stores/dialog.store';

// Form validation schema
const schema = z.object({
	title: z.string().min(1, 'Título es obligatorio'),
	description: z.string().min(1, 'Descripción es obligatoria'),
});

type FormData = z.infer<typeof schema>;

interface TasksPageProps {
	isAdmin?: boolean;
}

export default function TasksPage({ isAdmin = false }: TasksPageProps) {
	const { user } = useUserStore();
	const {
		filteredTasks,
		loadingFetch,
		error,
		isAdminMode,
		setSearchTerm,
		fetchTasks,
		fetchAdminTasks,
		setAdminMode,
	} = useTaskStore();
	const { openDialog } = useDialogStore();

	const {
		setFocus,
		formState: { errors },
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	const [isOpen, setIsOpen] = useState(false);
	const [order, setOrder] = useState<string[]>([]);

	// Check user permissions
	const hasAdminPermission =
		user?.permissions?.includes(Permission.TASK_READ_ANY_LIST) || false;
	const canCreate = user?.permissions?.includes(Permission.TASK_CREATE);
	const canEdit = isAdmin
		? user?.permissions?.includes(Permission.TASK_UPDATE_ANY)
		: user?.permissions?.includes(Permission.TASK_UPDATE_OWN);
	const canDelete = isAdmin
		? user?.permissions?.includes(Permission.TASK_DELETE_ANY)
		: user?.permissions?.includes(Permission.TASK_DELETE_OWN);
	const canView =
		user?.permissions?.includes(Permission.TASK_READ_OWN_LIST) ||
		hasAdminPermission;

	// Set admin mode based on props and sync tasks
	useEffect(() => {
		setAdminMode(isAdmin && hasAdminPermission);
	}, [isAdmin, hasAdminPermission, setAdminMode]);

	// Fetch tasks when component mounts or admin mode changes
	useEffect(() => {
		if (isAdminMode) {
			fetchAdminTasks();
		} else {
			fetchTasks();
		}
	}, [fetchTasks, fetchAdminTasks, isAdminMode]);

	// Update order when filteredTasks change
	useEffect(() => {
		setOrder(filteredTasks.map((t) => t.id));
	}, [filteredTasks]);

	// Sort tasks according to the established order
	const ordered = order
		.map((id) => filteredTasks.find((t) => t.id === id))
		.filter(Boolean) as typeof filteredTasks;

	return (
		<div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
			<h1 className="text-2xl font-semibold text-center mb-6">
				{isAdminMode ? 'Administración de Tareas' : 'Mis Tareas'}
			</h1>

			{error && (
				<div className="p-2 mb-4 bg-red-50 text-red-700 rounded-md border border-red-200">
					Error: {error}
				</div>
			)}

			<div className="flex flex-col sm:flex-row gap-4 mb-4">
				<SearchBar
					onSearch={setSearchTerm}
					placeholder="Buscar por título o descripción..."
					className="flex-grow"
				/>

				{canCreate && (
					<Button
						onClick={() => openDialog('create')}
						className="whitespace-nowrap"
					>
						Nueva Tarea
					</Button>
				)}
			</div>

			{loadingFetch ? (
				<div className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<TaskSortableSkeleton key={i} />
					))}
				</div>
			) : !ordered.length ? (
				<div className="text-center py-8">
					<p className="text-gray-500 mb-4">
						No hay tareas disponibles.
					</p>
					{canCreate && (
						<Button onClick={() => openDialog('create')}>
							Crear primera tarea
						</Button>
					)}
				</div>
			) : (
				<TaskList
					ordered={ordered}
					order={order}
					setOrder={setOrder}
					canEdit={canEdit}
					canDelete={canDelete}
					canView={canView}
				/>
			)}

			<TaskDialogWrapper />
		</div>
	);
}
