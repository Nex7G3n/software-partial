import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { NavigateFunction } from 'react-router-dom';
import type { User, UserState } from '../types/user.interface';
import { userService } from '../services/user.service';
import { AxiosError } from 'axios';

const initialState: Pick<UserState, 'user' | 'token' | 'loading'> = {
	user: null,
	token: null,
	loading: false,
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			...initialState,

			setUser: (user: User | null) => {
				set({ user });
				toast.success(
					user ? 'Usuario cargado correctamente' : 'Sesión cerrada',
				);
			},

			setToken: (token: string | null) => set({ token }),

			clearUser: () => {
				set({ ...initialState });
				toast.info('Sesión cerrada');
			},

			setLoading: (loading: boolean) => set({ loading }),

			loginCallback: async (navigate: NavigateFunction) => {
				const searchParams = new URLSearchParams(
					window.location.search,
				);
				const token = searchParams.get('token');
				if (!token) {
					toast.error('Token no encontrado en la URL.');
					navigate('/');
					return;
				}

				setToken(token);

				try {
					const user = await userService.getCurrentUser();
					set({ user });
					toast.success('Sesión iniciada correctamente');
					navigate('/dashboard');
				} catch (error: unknown) {
					if (error instanceof AxiosError) {
						console.error('Error al validar token', error);
						set({ token: null, user: null });
						toast.error('Error de autenticación. Redirigiendo...');
						navigate('/');
					} else {
						console.error('An unknown error occurred', error);
						set({ token: null, user: null });
						toast.error(
							'An unknown error occurred. Redirigiendo...',
						);
						navigate('/');
					}
				}
			},

			fetchUserData: async (navigate: NavigateFunction) => {
				set({ loading: true });
				const { token } = get();

				if (!token) {
					set({ loading: false });
					toast.error(
						'No hay token de autenticación. Redirigiendo...',
					);
					navigate('/');
					return;
				}

				try {
					const user = await userService.getCurrentUser();
					set({ user, loading: false });
					toast.success('Bienvenido de nuevo');
					navigate('/dashboard');
				} catch (error: unknown) {
					if (error instanceof AxiosError) {
						console.error('Authentication error:', error);
						set({ user: null, loading: false });
						toast.error('Error de autenticación. Redirigiendo...');
						navigate('/');
					} else {
						console.error('An unknown error occurred:', error);
						set({ user: null, loading: false });
						toast.error(
							'An unknown error occurred. Redirigiendo...',
						);
						navigate('/');
					}
				}
			},

			logout: async (navigate: NavigateFunction) => {
				try {
					await userService.logout();
					set({ token: null, user: null });
					toast.success('Sesión cerrada correctamente');
					navigate('/');
				} catch (error: unknown) {
					if (error instanceof AxiosError) {
						console.error('Logout failed', error);
						toast.error('No se pudo cerrar sesión');
					} else {
						console.error('An unknown error occurred', error);
						toast.error('An unknown error occurred');
					}
				}
			},
		}),
		{
			name: 'user-auth-storage',
			partialize: (state) => ({
				token: state.token,
				user: state.user,
			}),
		},
	),
);

export const setUser = (user: User | null) =>
	useUserStore.getState().setUser(user);
export const setToken = (token: string | null) =>
	useUserStore.getState().setToken(token);
export const clearUser = () => useUserStore.getState().clearUser();
export const setLoading = (loading: boolean) =>
	useUserStore.getState().setLoading(loading);
export const fetchUserData = (navigate: NavigateFunction) =>
	useUserStore.getState().fetchUserData(navigate);
export const loginCallback = (navigate: NavigateFunction) =>
	useUserStore.getState().loginCallback(navigate);
export const logout = (navigate: NavigateFunction) =>
	useUserStore.getState().logout(navigate);
