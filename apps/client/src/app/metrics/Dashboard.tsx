import { useEffect, useState } from 'react';
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
} from 'chart.js';
import type { ChartOptions } from 'chart.js'; // Import ChartOptions as a type
import { Pie, Line, Bar } from 'react-chartjs-2';
import { useUserStore } from '../../stores/user.store';
import { useTaskStore } from '../../stores/task.store';
import { Permission } from '../../types/permission.enum';
import { TaskStatus } from '../../types/tasks.interface'; // Import TaskStatus
import DashboardSkeleton from './dashboard.skeleton';

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
);

// Colores consistentes para todos los gráficos
const chartColors = {
	blue: 'rgba(54, 162, 235, 0.8)',
	red: 'rgba(255, 99, 132, 0.8)',
	yellow: 'rgba(255, 206, 86, 0.8)',
	green: 'rgba(75, 192, 192, 0.8)',
	purple: 'rgba(153, 102, 255, 0.8)',
	orange: 'rgba(255, 159, 64, 0.8)',
};

const Dashboard = () => {
	const { user } = useUserStore();
	const isAdmin = user?.permissions?.includes(Permission.TASK_READ_ANY_LIST);
	const { metrics, fetchMetrics, fetchMetricsAdmin } = useTaskStore();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				if (isAdmin) {
					await fetchMetricsAdmin();
				} else {
					await fetchMetrics();
				}
			} catch (error) {
				console.error('Error fetching metrics:', error);
				setError(
					'Ha ocurrido un error al cargar las métricas. Por favor, inténtelo de nuevo más tarde.',
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [isAdmin, fetchMetrics, fetchMetricsAdmin]);

	if (isLoading) return <DashboardSkeleton />;

	if (error)
		return (
			<div
				className="p-4 bg-red-50 border border-red-200 rounded-lg"
				role="alert"
			>
				<div className="flex">
					<div className="flex-shrink-0">
						<svg
							className="h-5 w-5 text-red-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-red-800">
							Error
						</h3>
						<div className="mt-1 text-sm text-red-700">{error}</div>
						<button
							onClick={() => {
								if (isAdmin) fetchMetricsAdmin();
								else fetchMetrics();
							}}
							className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							aria-label="Reintentar cargar métricas"
						>
							Reintentar
						</button>
					</div>
				</div>
			</div>
		);

	if (!metrics)
		return (
			<div
				className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
				role="alert"
			>
				<p className="text-yellow-700">
					No hay datos disponibles en este momento.
				</p>
			</div>
		);

	// Preparación datos para gráficos
	const statusLabels = metrics.tasksByStatus.map((item) => item.status);
	const statusData = metrics.tasksByStatus.map((item) => item.count);

	const statusChartData = {
		labels: statusLabels,
		datasets: [
			{
				data: statusData,
				backgroundColor: [
					chartColors.blue,
					chartColors.red,
					chartColors.yellow,
					chartColors.green,
				],
				borderWidth: 1,
			},
		],
	};

	const timelineChartData = {
		labels: (metrics.timeline || []).map(
			(item: { date: string; count: number }) => {
				// Formato más legible para fechas
				const date = new Date(item.date);
				return date.toLocaleDateString('es-ES', {
					day: '2-digit',
					month: '2-digit',
				});
			},
		),
		datasets: [
			{
				label: 'Tareas Creadas',
				data: (metrics.timeline || []).map(
					(item: { date: string; count: number }) => item.count,
				),
				borderColor: chartColors.green,
				backgroundColor: chartColors.green.replace('0.8', '0.2'),
				tension: 0.3,
				fill: true,
			},
		],
	};

	// Opciones comunes para todos los gráficos
	const commonOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom' as const, // Explicitly cast to literal type
				labels: {
					padding: 20,
					usePointStyle: true,
					font: {
						size: 12,
					},
				},
			},
			tooltip: {
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				padding: 12,
				titleFont: {
					size: 14,
					weight: 'bold' as const, // Explicitly cast to literal type
				},
				bodyFont: {
					size: 13,
				},
				displayColors: true,
				intersect: false,
			},
		},
	};

	// Opciones específicas para el gráfico de línea
	const lineOptions = {
		...commonOptions,
		scales: {
			x: {
				grid: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
			},
		},
	};

	// Preparación de gráfico de usuarios (solo para administradores)
	const userChartData =
		isAdmin && metrics.tasksByUser
			? {
					labels: metrics.tasksByUser.map((item) => item.userName),
					datasets: [
						{
							label: 'Tareas por Usuario',
							data: metrics.tasksByUser.map((item) => item.count),
							backgroundColor: Object.values(chartColors).slice(
								0,
								metrics.tasksByUser.length,
							),
							borderWidth: 1,
						},
					],
				}
			: null;

	// Calcular porcentajes para mostrar información más valiosa
	const completedTasksCount =
		metrics.tasksByStatus.find((s) => s.status === TaskStatus.COMPLETED)
			?.count || 0;
	const pendingTasksCount =
		metrics.tasksByStatus.find((s) => s.status === TaskStatus.PENDING)
			?.count || 0;

	const completionPercentage =
		metrics.totalTasks > 0
			? Math.round((completedTasksCount / metrics.totalTasks) * 100)
			: 0;

	return (
		<div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
			<header className="border-b pb-4 mb-6">
				<h1
					className="text-2xl font-bold text-gray-800"
					id="dashboard-title"
				>
					Dashboard de Tareas
				</h1>
				<p className="text-gray-600 mt-1">
					Vista general del progreso y distribución de tareas
				</p>
			</header>

			{/* Tarjetas de resumen */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
					<h2 className="text-sm font-medium text-gray-500">
						Total de Tareas
					</h2>
					<p className="text-2xl font-bold mt-1">
						{metrics.totalTasks}
					</p>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
					<h2 className="text-sm font-medium text-gray-500">
						Tareas Completadas
					</h2>
					<div className="flex items-center">
						<p className="text-2xl font-bold mt-1">
							{completedTasksCount}
						</p>
						<span className="ml-2 text-sm text-green-600">
							{completionPercentage}%
						</span>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
					<h2 className="text-sm font-medium text-gray-500">
						Tareas Pendientes
					</h2>
					<p className="text-2xl font-bold mt-1">
						{pendingTasksCount}
					</p>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
					<h2 className="text-sm font-medium text-gray-500">
						Actividad Reciente
					</h2>
					<p className="text-2xl font-bold mt-1">
						{(metrics.timeline?.length ?? 0) > 0
							? metrics.timeline[metrics.timeline.length - 1]
									.count
							: 0}
					</p>
				</div>
			</div>

			{/* Gráficos principales */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Distribución por Estado */}
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2
						className="text-lg font-semibold mb-4"
						id="status-chart-title"
					>
						Distribución por Estado
					</h2>
					<div className="h-64" aria-describedby="status-chart-title">
						<Pie
							data={statusChartData}
							options={{
								...commonOptions,
								plugins: {
									...commonOptions.plugins,
									tooltip: {
										...commonOptions.plugins.tooltip,
										callbacks: {
											label: function (context) {
												const label =
													context.label || '';
												const value =
													(context.raw as number) ||
													0; // Explicitly cast to number
												const total =
													context.dataset.data.reduce(
														(a, b) => a + b,
														0,
													);
												const percentage = Math.round(
													(value / total) * 100,
												);
												return `${label}: ${value} (${percentage}%)`;
											},
										},
									},
								},
							}}
						/>
					</div>
					<div className="sr-only" role="status" aria-live="polite">
						Gráfico de distribución de tareas por estado.{' '}
						{statusLabels
							.map(
								(label, index) =>
									`${label}: ${statusData[index]} tareas. `,
							)
							.join('')}
					</div>
				</div>

				{/* Línea de Tiempo */}
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2
						className="text-lg font-semibold mb-4"
						id="timeline-chart-title"
					>
						Tendencia de Creación de Tareas
					</h2>
					<div
						className="h-64"
						aria-describedby="timeline-chart-title"
					>
						<Line
							data={timelineChartData}
							options={lineOptions as ChartOptions<'line'>}
						/>
					</div>
					<div className="sr-only" role="status" aria-live="polite">
						Gráfico de tendencia de creación de tareas a lo largo
						del tiempo.
					</div>
				</div>
			</div>

			{/* Gráfico por Usuario (Solo Admin) */}
			{isAdmin && userChartData && (
				<div className="bg-white p-6 rounded-lg shadow-md">
					<h2
						className="text-lg font-semibold mb-4"
						id="user-chart-title"
					>
						Distribución de Tareas por Usuario
					</h2>
					<div className="h-80" aria-describedby="user-chart-title">
						<Bar
							data={userChartData}
							options={
								{
									...commonOptions,
									indexAxis:
										metrics.tasksByUser?.length > 8
											? 'y'
											: 'x',
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												precision: 0,
											},
										},
									},
								} as ChartOptions<'bar'>
							}
						/>
					</div>
					<div className="sr-only" role="status" aria-live="polite">
						Gráfico de distribución de tareas por usuario.{' '}
						{metrics.tasksByUser &&
							metrics.tasksByUser
								.map(
									(item) =>
										`${item.userName}: ${item.count} tareas. `,
								)
								.join('')}
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
