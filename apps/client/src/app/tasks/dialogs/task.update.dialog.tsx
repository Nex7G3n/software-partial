import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Description,
} from '@headlessui/react';
import { Button } from '../../components/Button';
import { useDialogStore } from '../../../stores/dialog.store';

export function ChangeStateDialog({ onChangeState }: any) {
	const { isOpen, closeDialog } = useDialogStore();
	return (
		<Dialog
			open={isOpen}
			as="div"
			className="relative z-10"
			onClose={closeDialog}
		>
			<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
					<DialogTitle as="h3" className="text-lg font-medium">
						Cambiar estado
					</DialogTitle>
					<Description>
						¿Deseas cambiar el estado de esta tarea?
					</Description>

					<div className="flex justify-end gap-3 mt-4">
						<Button onClick={closeDialog} variant="secondary">
							Cancelar
						</Button>
						<Button onClick={onChangeState} variant="primary">
							Cambiar
						</Button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
