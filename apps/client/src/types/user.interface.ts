import { NavigateFunction } from 'react-router-dom';

export interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
	permissions?: string[]; // Add permissions array
	roles?: string[]; // Add roles array
}

export interface UserState {
	user: User | null;
	token: string | null;
	loading: boolean;

	setUser: (user: User | null) => void;
	setToken: (token: string | null) => void;
	clearUser: () => void;
	setLoading: (loading: boolean) => void;

	loginCallback: (navigate: NavigateFunction) => void;
	fetchUserData: (navigate: NavigateFunction) => Promise<void>;
	logout: (navigate: NavigateFunction) => Promise<void>;
}
