// src/pages/auth/CallbackPage.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginCallback } from '../../../stores/user.store';

export default function CallbackPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const error = new URLSearchParams(location.search).get('error');

	useEffect(() => {
		if (error) {
			navigate('/');
		} else {
			loginCallback(navigate);
		}
	}, [error, navigate, loginCallback]);

	return (
		<div>
			<h1>Google Callback Page</h1>
			<p>Procesando autenticación de Google...</p>
			{error && <p style={{ color: 'red' }}>Error: {error}</p>}
		</div>
	);
}
