import api from '../lib/axios';
import { User } from '../types/user.interface';

export const userService = {
	async getCurrentUser(): Promise<User> {
		const response = await api.get('/auth/me');
		return response.data;
	},

	async refreshToken(): Promise<string> {
		const response = await api.post('/auth/refresh', null, {
			withCredentials: true,
		});
		return response.data.accessToken;
	},

	async logout(): Promise<void> {
		await api.post('/auth/logout', null, {
			withCredentials: true,
		});
	},

	saveAccessTokenFromUrl(): string | null {
		const url = new URL(window.location.href);
		const token = url.searchParams.get('token');

		if (token) {
			window.history.replaceState({}, document.title, url.pathname);
			return token;
		}

		return null;
	},
};
