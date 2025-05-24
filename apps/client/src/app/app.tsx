import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { appRoutes } from './routes/index.routes';

export function App() {
	return (
		<>
			<Toaster richColors />
			<Routes>
				{appRoutes.map((route) => (
					<Route
						key={route.path}
						path={route.path}
						element={route.element}
					/>
				))}
			</Routes>
		</>
	);
}

export default App;
