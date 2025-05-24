import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';
import { useMemo } from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

/**
 * Componente que protege rutas que requieren autenticación
 * Redirecciona al usuario a la página de login si no está autenticado
 */
const ProtectedRoute = ({
	children,
	redirectTo = '/auth/login',
}: ProtectedRouteProps) => {
	const token = useUserStore((state) => state.token);
	// Memorizar el valor de autenticación para evitar cálculos repetidos
	const isAuthenticated = useMemo(() => !!token, [token]);

	if (!isAuthenticated) {
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
