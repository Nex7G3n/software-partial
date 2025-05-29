import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';
import { TaskSortableItem } from './task.item';
import type { Task } from '../../../types/tasks.interface';

interface TaskListProps {
	ordered: Task[];
	order: string[];
	setOrder: (order: string[]) => void;
	canEdit?: boolean;
	canDelete?: boolean;
	canView?: boolean;
	isDraggable?: boolean;
}

export function TaskList({
	ordered,
	order,
	setOrder,
	canEdit = true,
	canDelete = true,
	canView = true,
	isDraggable = true,
}: TaskListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
	);

	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = order.indexOf(active.id as string);
		const newIndex = order.indexOf(over.id as string);

		if (oldIndex !== -1 && newIndex !== -1) {
			const newOrder = arrayMove(order, oldIndex, newIndex);
			setOrder(newOrder);
		}
	};

	// If drag and drop is disabled, render a simple list
	if (!isDraggable) {
		return (
			<div className="space-y-4">
				{ordered.map((task) => ( // Removed 'i'
					<TaskSortableItem
						key={task.id}
						task={task}
						// index={i} // Removed: no longer needed
						canEdit={canEdit}
						canDelete={canDelete}
						canView={canView}
						isDraggable={false}
					/>
				))}
			</div>
		);
	}

	// Otherwise render the sortable list with drag and drop
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={onDragEnd}
		>
			<SortableContext
				items={order}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-4">
					{ordered.map((task) => ( // Removed 'i'
						<TaskSortableItem
							key={task.id}
							task={task}
							// index={i} // Removed: no longer needed
							canEdit={canEdit}
							canDelete={canDelete}
							canView={canView}
							isDraggable={true}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
