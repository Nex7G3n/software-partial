import { FaGoogle } from 'react-icons/fa';

export default function LandingPage() {
	return (
		<div className="min-h-screen flex flex-col justify-between bg-white text-neutral-800">
			{/* Encabezado */}
			<header className="p-4 flex justify-between items-center shadow">
				<div className="text-xl font-bold text-neutral-900">
					BaseApp
				</div>
			</header>

			{/* Contenido principal */}
			<main className="flex flex-1 flex-col items-center justify-center text-center px-4">
				<h1 className="text-3xl font-bold mb-4">
					Bienvenido a BaseApp
				</h1>
				<p className="text-neutral-500 mb-8 max-w-md">
					Una plataforma simple para empezar. Todo lo demás es
					decorativo.
				</p>
				<a href="/api/auth/google">
					<button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-lg hover:bg-neutral-900 transition hover:cursor-pointer">
						<FaGoogle /> Iniciar sesión con Google
					</button>
				</a>
			</main>

			{/* Pie de página */}
			<footer className="text-center text-sm text-neutral-400 py-6">
				&copy; {new Date().getFullYear()} BaseApp
			</footer>
		</div>
	);
}
