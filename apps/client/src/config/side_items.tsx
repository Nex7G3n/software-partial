import { NavItem } from '../types/menu.interface';
import { Permission } from '../types/permission.enum';
import {
	HiOutlineChartBar,
	HiOutlineClipboardList,
	HiOutlineDocumentText,
	HiOutlineCog,
	HiOutlineUsers,
} from 'react-icons/hi';

const navItems: NavItem[] = [
	{
		path: '/dashboard',
		label: 'Dashboard',
		icon: <HiOutlineChartBar className="w-5 h-5" />,
	},
	{
		path: '/tasks',
		label: 'Mis Tareas',
		icon: <HiOutlineDocumentText className="w-5 h-5" />,
		requiredPermission: Permission.TASK_READ_OWN_LIST,
	},
	{
		path: '/admin/tasks',
		label: 'Todas las Tareas',
		icon: <HiOutlineClipboardList className="w-5 h-5" />,
		requiredPermission: Permission.TASK_READ_ANY_LIST,
	},
	{
		path: '/settings',
		label: 'Configuración',
		icon: <HiOutlineCog className="w-5 h-5" />,
		requiredPermission: Permission.SETTINGS_VIEW,
	},
];

export default navItems;
