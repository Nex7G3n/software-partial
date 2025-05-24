import Input from '../../components/Input';
import { Button } from '../../components/Button';
import { useDialogStore } from '../../../stores/dialog.store';
import { useForm } from 'react-hook-form';
import {
	CreateTaskDto,
	Task,
	UpdateTaskDto,
} from '../../../types/tasks.interface';
import { useTaskStore } from '../../../stores/task.store';

type TaskEditContentProps = {
	mode: 'create' | 'edit';
};

export function TaskEditContent({ mode }: TaskEditContentProps) {
	const { closeDialog, currentTask } = useDialogStore();
	const { createTask, updateTask } = useTaskStore();

	const isCreate = mode === 'create';

	const onSubmit = (data: Partial<Task>) => {
		if (isCreate) {
			createTask(data as CreateTaskDto);
		} else {
			updateTask(currentTask!.id, data as UpdateTaskDto);
		}
		closeDialog();
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: isCreate ? {} : currentTask,
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div>
				<label htmlFor="title" className="block text-sm font-medium">
					Título
				</label>
				<Input id="title" register={register} variant="primary" />
				{errors.title && (
					<p className="text-sm text-red-500 mt-1">
						{errors.title.message}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium"
				>
					Descripción
				</label>
				<Input
					id="description"
					register={register}
					variant="primary"
					as="textarea"
					rows={3}
				/>
				{errors.description && (
					<p className="text-sm text-red-500 mt-1">
						{errors.description.message}
					</p>
				)}
			</div>

			<div className="flex justify-end gap-3">
				<Button type="button" onClick={closeDialog} variant="secondary">
					Cancelar
				</Button>
				<Button type="submit" variant="primary">
					{isCreate ? 'Crear' : 'Guardar'}
				</Button>
			</div>
		</form>
	);
}
