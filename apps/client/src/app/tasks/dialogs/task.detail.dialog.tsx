import { Button } from '../../components/Button';
import { Task, TaskStatus } from '../../../types/tasks.interface';
import { useDialogStore } from '../../../stores/dialog.store';

type TaskDetailContentProps = {
	task: Task | null;
};

export function TaskDetailContent({ task }: TaskDetailContentProps) {
	const { closeDialog } = useDialogStore();

	return (
		<>
			<div className="space-y-4">
				<div>
					<p className="text-sm font-medium text-gray-700">Título</p>
					<p className="text-base text-gray-900">{task?.title}</p>
				</div>

				<div>
					<p className="text-sm font-medium text-gray-700">
						Descripción
					</p>
					<p className="text-base text-gray-900">
						{task?.description || 'Sin descripción'}
					</p>
				</div>

				<div>
					<p className="text-sm font-medium text-gray-700">Estado</p>
					<p className="text-base text-gray-900">
						{translateStatus(task?.status)}
					</p>
				</div>

				<div>
					<p className="text-sm font-medium text-gray-700">Creado</p>
					<p className="text-base text-gray-900">
						{task?.createdAt
							? new Date(task.createdAt).toLocaleString()
							: 'N/A'}
					</p>
				</div>

				<div>
					<p className="text-sm font-medium text-gray-700">
						Última actualización
					</p>
					<p className="text-base text-gray-900">
						{task?.updatedAt
							? new Date(task.updatedAt).toLocaleString()
							: 'N/A'}
					</p>
				</div>
			</div>

			<div className="flex justify-end mt-6">
				<Button onClick={closeDialog} variant="secondary">
					Cerrar
				</Button>
			</div>
		</>
	);
}

function translateStatus(status?: TaskStatus): string {
	switch (status) {
		case TaskStatus.PENDING:
			return 'Pendiente';
		case TaskStatus.IN_PROGRESS:
			return 'En progreso';
		case TaskStatus.COMPLETED:
			return 'Completada';
		default:
			return 'Desconocido';
	}
}
