import { RouteConfig } from '../../types/routes.interface';
import CallbackPage from '../auth/callback/page';
import LoginPage from '../auth/login/page';
import LogoutPage from '../auth/logout/LogoutPage';
import RegisterPage from '../auth/register/page';
import LandingPage from '../landing/index/page';

export const publicRoutes: RouteConfig[] = [
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/auth/login',
		element: <LoginPage />,
	},
	{
		path: '/auth/register',
		element: <RegisterPage />,
	},
	{
		path: '/auth/login/callback',
		element: <CallbackPage />,
	},
	{
		path: '/auth/logout',
		element: <LogoutPage />,
	},
];
