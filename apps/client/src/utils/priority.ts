export const getPriorityColor = (priority) => {
	switch (priority?.toLowerCase()) {
		case 'alta':
			return 'bg-red-100 text-red-800';
		case 'media':
			return 'bg-yellow-100 text-yellow-800';
		case 'baja':
			return 'bg-green-100 text-green-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
};
