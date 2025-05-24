import { ChangeEvent, useState } from 'react';

interface SearchBarProps {
	onSearch: (searchTerm: string) => void;
	placeholder?: string;
	className?: string;
}

/**
 * Componente de barra de búsqueda reutilizable
 * Permite filtrar contenido en diferentes partes de la aplicación
 */
const SearchBar = ({
	onSearch,
	placeholder = 'Buscar...',
	className = '',
}: SearchBarProps) => {
	const [searchTerm, setSearchTerm] = useState('');

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		onSearch(value);
	};

	return (
		<div className={`relative w-full ${className}`}>
			<input
				type="text"
				value={searchTerm}
				onChange={handleChange}
				placeholder={placeholder}
				className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					></path>
				</svg>
			</div>
		</div>
	);
};

export default SearchBar;
