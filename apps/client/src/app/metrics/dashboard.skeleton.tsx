import React from 'react';

const DashboardSkeleton = () => {
	return (
		<div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
			{/* Header Skeleton */}
			<header className="border-b pb-4 mb-6">
				<div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
				<div className="h-4 bg-gray-100 rounded w-96"></div>
			</header>

			{/* Summary Cards Skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={`summary-${i}`}
						className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-200"
					>
						<div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
						<div className="h-7 bg-gray-300 rounded w-16"></div>
					</div>
				))}
			</div>

			{/* Charts Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Pie Chart Skeleton */}
				<div className="bg-white p-6 rounded-lg shadow-md">
					<div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
					<div className="flex justify-center items-center">
						<div className="relative w-48 h-48 rounded-full bg-gray-100">
							{/* Fake pie segments */}
							<div className="absolute inset-0 rounded-full border-8 border-t-gray-300 border-r-gray-200 border-b-gray-300 border-l-gray-200"></div>
						</div>
					</div>
					<div className="mt-6 flex justify-center">
						<div className="flex flex-wrap gap-4 justify-center">
							{[...Array(4)].map((_, i) => (
								<div
									key={`legend-${i}`}
									className="flex items-center"
								>
									<div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
									<div className="h-4 bg-gray-200 rounded w-16"></div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Line Chart Skeleton */}
				<div className="bg-white p-6 rounded-lg shadow-md">
					<div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
					<div className="h-64 flex flex-col justify-between">
						<div className="w-full flex justify-between items-center mb-1">
							<div className="h-4 bg-gray-200 rounded w-1/6"></div>
							<div className="h-4 bg-gray-200 rounded w-1/6"></div>
							<div className="h-4 bg-gray-200 rounded w-1/6"></div>
							<div className="h-4 bg-gray-200 rounded w-1/6"></div>
						</div>
						<div className="relative h-48 w-full">
							{/* Fake chart grid */}
							<div className="absolute inset-0 border-b border-l border-gray-200 flex flex-col justify-between">
								<div className="w-full h-px bg-gray-100"></div>
								<div className="w-full h-px bg-gray-100"></div>
								<div className="w-full h-px bg-gray-100"></div>
							</div>
							{/* Fake line chart */}
							<div className="absolute left-0 right-0 bottom-10 h-16">
								<svg
									className="w-full h-full"
									viewBox="0 0 100 100"
									preserveAspectRatio="none"
								>
									<path
										d="M0,50 Q20,20 40,40 T60,30 T100,15"
										fill="none"
										stroke="rgb(229, 231, 235)"
										strokeWidth="4"
										className="transition-all"
									/>
								</svg>
							</div>
						</div>
						<div className="w-full flex justify-between pt-2">
							<div className="h-3 bg-gray-200 rounded w-6"></div>
							<div className="h-3 bg-gray-200 rounded w-6"></div>
							<div className="h-3 bg-gray-200 rounded w-6"></div>
							<div className="h-3 bg-gray-200 rounded w-6"></div>
							<div className="h-3 bg-gray-200 rounded w-6"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Bar Chart Skeleton (Admin) */}
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
				<div className="h-80 flex items-end justify-between px-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={`bar-${i}`}
							className="flex flex-col items-center w-1/6"
						>
							<div
								className="w-full bg-gray-200 rounded-t"
								style={{
									height: `${
										Math.floor(Math.random() * 100) + 50
									}px`,
								}}
							></div>
							<div className="h-4 bg-gray-100 rounded w-16 mt-2"></div>
						</div>
					))}
				</div>
			</div>

			{/* Loading message for screen readers */}
			<div className="sr-only" role="status" aria-live="polite">
				Cargando el dashboard de tareas, por favor espere...
			</div>
		</div>
	);
};

export default DashboardSkeleton;
