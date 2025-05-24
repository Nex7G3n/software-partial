import axios from 'axios';
import { toast } from 'sonner';
import { useUserStore } from '../stores/user.store';
import { userService } from '../services/user.service';

const api = axios.create({
	baseURL: import.meta.env.API_URL || 'http://localhost:5173/api',
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token = useUserStore.getState().token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const newToken = await userService.refreshToken();
				useUserStore.getState().setToken(newToken);
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return api(originalRequest);
			} catch {
				useUserStore.getState().clearUser();
				toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.');
				window.location.href = '/';
			}
		}
		return Promise.reject(error);
	},
);

export default api;
