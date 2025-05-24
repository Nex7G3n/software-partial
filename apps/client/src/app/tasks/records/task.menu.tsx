import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from '@headlessui/react';
import {
	HiDotsVertical,
	HiPencil,
	HiTrash,
	HiEye,
	HiCheck,
	HiX,
} from 'react-icons/hi';
import { Fragment } from 'react';
import { useTaskStore } from '../../../stores/task.store';
import { useDialogStore } from '../../../stores/dialog.store';
import { Task, TaskStatus } from '../../../types/tasks.interface';

interface TaskMenuProps {
	task: Task;
	canEdit?: boolean;
	canDelete?: boolean;
	canView?: boolean;
}

export function TaskMenu({
	task,
	canEdit = true,
	canDelete = true,
	canView = true,
}: TaskMenuProps) {
	const { updateTask } = useTaskStore();
	const { openDialog } = useDialogStore();

	const toggleCompletion = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!canEdit) return;

		await updateTask(task.id, {
			status:
				task.status === TaskStatus.COMPLETED
					? TaskStatus.PENDING
					: TaskStatus.COMPLETED,
		});
	};

	return (
		<div className="relative inline-block text-left">
			<Menu>
				<MenuButton
					onClick={(e) => e.stopPropagation()}
					className="inline-flex justify-center p-2 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none hover:cursor-pointer"
				>
					<HiDotsVertical className="h-5 w-5" aria-hidden="true" />
				</MenuButton>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg focus:outline-none">
						{canView && (
							<MenuItem>
								{({ active }) => (
									<button
										onClick={(e) => {
											e.stopPropagation();
											openDialog('view', task);
										}}
										className={`${
											active
												? 'bg-gray-100 hover:cursor-pointer'
												: ''
										} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
									>
										<HiEye className="h-5 w-5 text-gray-500" />
										Ver detalles
									</button>
								)}
							</MenuItem>
						)}

						{canEdit && (
							<>
								<MenuItem>
									{({ active }) => (
										<button
											onClick={(e) => {
												e.stopPropagation();
												openDialog('edit', task);
											}}
											className={`${
												active
													? 'bg-gray-100 hover:cursor-pointer'
													: ''
											} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
										>
											<HiPencil className="h-5 w-5 text-gray-500" />
											Editar
										</button>
									)}
								</MenuItem>

								<MenuItem>
									{({ active }) => (
										<button
											onClick={toggleCompletion}
											className={`${
												active
													? 'bg-gray-100 hover:cursor-pointer'
													: ''
											} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
										>
											{task.status ===
											TaskStatus.COMPLETED ? (
												<>
													<HiX className="h-5 w-5 text-gray-500" />
													Marcar como pendiente
												</>
											) : (
												<>
													<HiCheck className="h-5 w-5 text-gray-500" />
													Marcar como completada
												</>
											)}
										</button>
									)}
								</MenuItem>
							</>
						)}

						{canDelete && (
							<MenuItem>
								{({ active }) => (
									<button
										onClick={(e) => {
											e.stopPropagation();
											openDialog('delete', task);
										}}
										className={`${
											active
												? 'bg-gray-100 hover:cursor-pointer'
												: ''
										} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
									>
										<HiTrash className="h-5 w-5 text-gray-500" />
										Eliminar
									</button>
								)}
							</MenuItem>
						)}
					</MenuItems>
				</Transition>
			</Menu>
		</div>
	);
}
