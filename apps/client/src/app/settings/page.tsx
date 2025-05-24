import {
	HiOutlineUser,
	HiOutlineMail,
	HiOutlineIdentification,
	HiOutlineShieldCheck,
	HiOutlineKey,
} from 'react-icons/hi';
import { useUserStore } from '../../stores/user.store';
import { IconType } from 'react-icons/lib';

const InfoCard = ({
	icon: Icon,
	label,
	value,
}: {
	icon: IconType;
	label: string;
	value: React.ReactNode;
}) => (
	<div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 min-w-[250px] flex-1">
		<Icon className="w-5 h-5 text-gray-500" />
		<div className="flex flex-col">
			<span className="font-semibold text-gray-600">{label}</span>
			<span className="text-gray-800 break-all">{value}</span>
		</div>
	</div>
);

export default function UserConfigPage() {
	const user = useUserStore((state) => state.user);

	if (!user) {
		return <div className="p-4 text-gray-500">Cargando usuario...</div>;
	}

	return (
		<div className="max-w-3xl mx-auto mt-6 px-4">
			<div className="bg-white border border-gray-200 rounded-2xl shadow p-6 space-y-6">
				<h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
					<HiOutlineUser className="w-6 h-6 text-gray-600" />
					Configuración del Usuario
				</h1>

				{/* Info Cards */}
				<div className="flex flex-wrap gap-4 text-sm text-gray-700">
					<InfoCard
						icon={HiOutlineUser}
						label="Nombre"
						value={user.name}
					/>
					<InfoCard
						icon={HiOutlineMail}
						label="Email"
						value={user.email}
					/>
					<InfoCard
						icon={HiOutlineIdentification}
						label="ID"
						value={user.id}
					/>
				</div>

				{/* Roles */}
				<div className="flex flex-col gap-2 text-sm text-gray-700">
					<div className="flex items-center gap-2">
						<HiOutlineShieldCheck className="w-5 h-5 text-gray-500" />
						<span className="font-semibold">Roles:</span>
					</div>
					<div className="flex flex-wrap gap-2 ml-7">
						{user.roles.map((role) => (
							<span
								key={role}
								className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs border border-gray-300"
							>
								{role}
							</span>
						))}
					</div>
				</div>

				{/* Permisos */}
				<div className="flex flex-col gap-2 text-sm text-gray-700">
					<div className="flex items-center gap-2">
						<HiOutlineKey className="w-5 h-5 text-gray-500" />
						<span className="font-semibold">Permisos:</span>
					</div>
					<div className="flex flex-wrap gap-2 ml-7">
						{user.permissions.map((perm) => (
							<span
								key={perm}
								className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded"
							>
								{perm}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
