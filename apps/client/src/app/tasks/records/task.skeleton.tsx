import {
	HiOutlineDotsVertical,
	HiViewGrid,
	HiOutlineCalendar,
	HiOutlineClock,
	HiOutlineTag,
} from 'react-icons/hi';

export function TaskSortableSkeleton() {
	return (
		<div className="flex rounded-lg bg-white border border-gray-200 mb-3 animate-pulse">
			<div className="cursor-grab w-10 flex items-center justify-center bg-gray-50 border-gray-200 text-gray-300">
				<HiViewGrid className="w-5 h-5" />
			</div>
			<div className="flex flex-1 p-4">
				<div className="flex-1">
					<div className="flex items-center flex-wrap gap-2 mb-1">
						<div className="h-4 bg-gray-300 rounded w-32" />
						<div className="h-4 bg-gray-200 rounded w-14" />
						<div className="h-4 bg-gray-100 rounded w-16" />
					</div>
					<div className="h-3 bg-gray-200 rounded w-3/4 mt-2" />
					<div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
						<div className="flex items-center">
							<HiOutlineCalendar className="w-4 h-4 mr-1" />
							<div className="h-3 bg-gray-200 rounded w-16" />
						</div>
						<div className="flex items-center">
							<HiOutlineClock className="w-4 h-4 mr-1" />
							<div className="h-3 bg-gray-200 rounded w-20" />
						</div>
						<div className="flex items-center">
							<HiOutlineTag className="w-4 h-4 mr-1" />
							<div className="h-3 bg-gray-200 rounded w-12" />
						</div>
					</div>
				</div>
				<div className="flex items-start ml-3">
					<div className="p-1.5 rounded-md text-gray-300">
						<HiOutlineDotsVertical className="w-5 h-5" />
					</div>
				</div>
			</div>
		</div>
	);
}
