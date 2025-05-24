import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Description,
	Transition,
} from '@headlessui/react';
import { Fragment } from 'react';

import { useDialogStore } from '../../../stores/dialog.store';
import { TaskEditContent } from './task.edit.dialog';
import { TaskDeleteContent } from './task.delete.dialog';
import { TaskDetailContent } from './task.detail.dialog';
import { TaskChangeStateContent } from './task.change.state.content';

export function TaskDialogWrapper() {
	const { isOpen, dialogMode, closeDialog, currentTask } = useDialogStore();

	const getTitleByMode = () => {
		switch (dialogMode) {
			case 'create':
				return 'Nueva tarea';
			case 'edit':
				return 'Editar tarea';
			case 'delete':
				return 'Confirmar eliminación';
			case 'view':
				return 'Detalles de la tarea';
			case 'state':
				return 'Cambiar estado';
			default:
				return '';
		}
	};

	const getDescriptionByMode = () => {
		switch (dialogMode) {
			case 'create':
				return 'Completa los campos para crear una nueva tarea';
			case 'edit':
				return 'Modifica los campos para editar la tarea';
			case 'delete':
				return '¿Seguro quieres eliminar esta tarea?';
			case 'view':
				return 'Consulta la información detallada de la tarea seleccionada.';
			case 'state':
				return '¿Deseas cambiar el estado de esta tarea?';
			default:
				return '';
		}
	};

	const renderContent = () => {
		switch (dialogMode) {
			case 'create':
			case 'edit':
				return <TaskEditContent mode={dialogMode} />;
			case 'delete':
				return <TaskDeleteContent />;
			case 'view':
				return <TaskDetailContent task={currentTask} />;
			case 'state':
				return <TaskChangeStateContent />;
			default:
				return null;
		}
	};

	if (!isOpen || !dialogMode) return null;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={closeDialog}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30" />
				</Transition.Child>

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
							<DialogTitle
								as="h3"
								className="text-lg font-medium"
							>
								{getTitleByMode()}
							</DialogTitle>
							<Description className="mt-1 mb-4 text-sm text-gray-600">
								{getDescriptionByMode()}
							</Description>
							{renderContent()}
						</DialogPanel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
}
