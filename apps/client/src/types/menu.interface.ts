import { Permission } from './permission.enum';

export interface NavItem {
	path: string;
	label: string;
	icon: React.ReactNode;
	requiredPermission?: Permission;
}
