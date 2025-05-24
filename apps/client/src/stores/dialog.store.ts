import { create } from 'zustand';
import { Task } from '../types/tasks.interface';

interface DialogState {
	isOpen: boolean;
	dialogMode: 'create' | 'edit' | 'delete' | 'view' | 'state' | null;
	currentTask: Task | null;
	openDialog: (mode: DialogState['dialogMode'], task?: Task) => void;
	closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
	isOpen: false,
	dialogMode: null,
	currentTask: null,
	openDialog: (mode, task = null) =>
		set({ isOpen: true, dialogMode: mode, currentTask: task }),
	closeDialog: () =>
		set({ isOpen: false, dialogMode: null, currentTask: null }),
}));
