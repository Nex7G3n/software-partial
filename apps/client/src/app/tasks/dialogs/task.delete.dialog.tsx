import { Button } from '../../components/Button';
import { useDialogStore } from '../../../stores/dialog.store';
import { useTaskStore } from '../../../stores/task.store';

export function TaskDeleteContent() {
	const { closeDialog, currentTask } = useDialogStore();
	const deleteTask = useTaskStore((state) => state.deleteTask);
	const isAdminMode = useTaskStore((state) => state.isAdminMode);

	const handleDelete = (taskId: string) => {
		if (isAdminMode) {
			useTaskStore.getState().deleteTaskAdmin(taskId);
			closeDialog();
		} else {
			deleteTask(taskId);
		}
	};

	return (
		<div className="flex justify-end gap-3 mt-4">
			<Button onClick={closeDialog} variant="secondary">
				Cancelar
			</Button>
			<Button
				onClick={() => handleDelete(currentTask?.id)}
				variant="primary"
				className="bg-red-600 hover:bg-red-700 text-white"
			>
				Eliminar
			</Button>
		</div>
	);
}
