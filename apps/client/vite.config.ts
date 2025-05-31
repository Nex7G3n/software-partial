import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		server: {
			port: 5173,
			proxy: {
				'/api': {
					target: 'http://localhost:3000',
					changeOrigin: true,
					secure: false,
				},
			},
		},
		plugins: [react(), tailwindcss()],
	};
});
