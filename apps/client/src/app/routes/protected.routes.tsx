import { RouteConfig } from '../../types/routes.interface';
import AuthGuard from '../guards/AuthGuard';
import DashboardLayout from '../layouts/dashboard.layout';
import Dashboard from '../metrics/Dashboard';
import UserConfigPage from '../settings/page';
import TasksPage from '../tasks/page';

export const protectedRoutes: RouteConfig[] = [
	{
		path: '/settings',
		element: (
			<AuthGuard>
				<DashboardLayout>
					<UserConfigPage />
				</DashboardLayout>
			</AuthGuard>
		),
	},
	{
		path: '/dashboard',
		element: (
			<AuthGuard>
				<DashboardLayout>
					<Dashboard />
				</DashboardLayout>
			</AuthGuard>
		),
	},
	{
		path: '/tasks',
		element: (
			<AuthGuard>
				<DashboardLayout>
					<TasksPage />
				</DashboardLayout>
			</AuthGuard>
		),
	},
	{
		path: '/admin/tasks',
		element: (
			<AuthGuard>
				<DashboardLayout>
					<TasksPage isAdmin={true} />
				</DashboardLayout>
			</AuthGuard>
		),
	},
];
