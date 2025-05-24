import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import { useUserStore } from '../../stores/user.store';

interface DashboardLayoutProps {
	children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const { user, loading } = useUserStore();

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-100">
			{user && <Sidebar />}
			<main className="flex-1 overflow-auto p-6">{children}</main>
		</div>
	);
};

export default DashboardLayout;
