import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LogoutPage: React.FC = () => {
	const { logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const performLogout = async () => {
			await logout();
			navigate('/');
		};

		performLogout();
	}, [logout, navigate]);

	return <div>Cerrando sesión...</div>;
};

export default LogoutPage;
