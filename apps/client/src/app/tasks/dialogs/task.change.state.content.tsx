import { Button } from '../../components/Button';
import { useDialogStore } from '../../../stores/dialog.store';

export function TaskChangeStateContent() {
	const { closeDialog, currentTask } = useDialogStore();

	const onChangeState = () => {
		console.log('Changing state for task:', currentTask?.id);
		closeDialog();
	};

	return (
		<div className="flex justify-end gap-3 mt-4">
			<Button onClick={closeDialog} variant="secondary">
				Cancelar
			</Button>
			<Button onClick={onChangeState} variant="primary">
				Cambiar
			</Button>
		</div>
	);
}
