import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';
import { useMemo, useCallback } from 'react';

/**
 * Hook personalizado para manejar la autenticación
 * Proporciona funciones y estados relacionados con la autenticación del usuario
 */
export const useAuth = () => {
	const navigate = useNavigate();
	// Obtener valores individuales del store para evitar re-renderizados innecesarios
	const token = useUserStore((state) => state.token);
	const user = useUserStore((state) => state.user);
	const loading = useUserStore((state) => state.loading);
	const fetchUserData = useUserStore((state) => state.fetchUserData);
	const logoutFn = useUserStore((state) => state.logout);

	// Memorizar el valor de autenticación
	const isAuthenticated = useMemo(() => !!token, [token]);

	// Función para iniciar sesión (redirige a la página de login)
	const login = useCallback(() => {
		navigate('/auth/login');
	}, [navigate]);

	// Función para cerrar sesión
	const handleLogout = useCallback(() => {
		logoutFn(navigate);
	}, [logoutFn, navigate]);

	// Función para cargar los datos del usuario
	const loadUserData = useCallback(() => {
		fetchUserData(navigate);
	}, [fetchUserData, navigate]);

	return {
		isAuthenticated,
		user,
		loading,
		login,
		logout: handleLogout,
		loadUserData,
	};
};
