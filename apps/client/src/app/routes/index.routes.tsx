import { RouteConfig } from '../../types/routes.interface';
import { protectedRoutes } from './protected.routes';
import { publicRoutes } from './public.routes';

export const appRoutes: RouteConfig[] = [...publicRoutes, ...protectedRoutes];
