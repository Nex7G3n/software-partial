import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';
import { useMemo } from 'react';

interface AuthGuardProps {
	children: React.ReactNode;
	redirectTo?: string;
}

/**
 * Componente AuthGuard que proporciona protección avanzada para rutas
 * - Verifica la autenticación del usuario
 * - Muestra indicador de carga durante la verificación
 * - Redirecciona a usuarios no autenticados
 * - Guarda la ubicación original para redirigir después del login
 */
const AuthGuard = ({
	children,
	redirectTo = '/auth/login',
}: AuthGuardProps) => {
	// Usar selector simple para cada valor individual para evitar re-renderizados innecesarios
	const token = useUserStore((state) => state.token);
	const loading = useUserStore((state) => state.loading);
	const location = useLocation();

	// Memorizar el valor de autenticación para evitar cálculos repetidos
	const isAuthenticated = useMemo(() => !!token, [token]);

	// Si está cargando, podríamos mostrar un spinner o mensaje
	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Verificando autenticación...
			</div>
		);
	}

	// Si no está autenticado, redirigir al login guardando la ubicación actual
	if (!isAuthenticated) {
		return (
			<Navigate
				to={redirectTo}
				state={{ from: location.pathname }}
				replace
			/>
		);
	}

	// Si está autenticado, mostrar el contenido protegido
	return <>{children}</>;
};

export default AuthGuard;
