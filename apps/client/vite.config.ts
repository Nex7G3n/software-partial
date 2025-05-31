import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3000';

	return {
		server: {
			port: 5173,
			proxy: {
				'/api': {
					target: backendUrl,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		plugins: [react(), tailwindcss()],
	};
});
