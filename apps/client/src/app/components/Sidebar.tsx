import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';
import { useAuth } from '../hooks/useAuth';
import navItems from '../../config/side_items';
import { HiOutlineLogout } from 'react-icons/hi';

const Sidebar: React.FC = () => {
	const { user } = useUserStore();
	const { logout } = useAuth();
	const navigate = useNavigate();

	if (!user || !user.permissions) return null;

	const filteredNavItems = navItems.filter(
		(item) =>
			!item.requiredPermission ||
			user.permissions!.includes(item.requiredPermission),
	);

	const handleLogout = () => {
		logout();
		navigate('/auth/logout');
	};

	return (
		<aside className="w-64 h-screen bg-neutral-900 text-white flex flex-col justify-between p-4">
			<div>
				{/* Header */}
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-white">Base App</h2>
					<p className="text-sm text-neutral-400">{user.name}</p>
				</div>

				{/* Navigation */}
				<nav>
					<ul className="space-y-1">
						{filteredNavItems.map((item) => (
							<li key={item.path}>
								<NavLink
									to={item.path}
									className={({ isActive }) =>
										`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
											isActive
												? 'bg-neutral-800 text-white'
												: 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
										}`
									}
								>
									{item.icon}
									<span className="text-sm">
										{item.label}
									</span>
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			</div>

			{/* Logout */}
			<div>
				<button
					onClick={handleLogout}
					className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors w-full hover:cursor-pointer"
				>
					<HiOutlineLogout className="w-5 h-5" />
					<span className="text-sm">Cerrar sesión</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
