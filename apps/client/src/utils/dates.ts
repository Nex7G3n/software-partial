export const getDueStatus = (dueDateStr) => {
	if (!dueDateStr) return null;

	const dueDate = new Date(dueDateStr);
	const today = new Date();
	const diffTime = dueDate - today;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return {
			text: `Vencida por ${Math.abs(diffDays)} días`,
			class: 'text-red-600',
		};
	} else if (diffDays === 0) {
		return { text: 'Vence hoy', class: 'text-yellow-600 font-medium' };
	} else if (diffDays <= 2) {
		return {
			text: `Vence en ${diffDays} días`,
			class: 'text-yellow-600',
		};
	} else {
		return {
			text: `Vence en ${diffDays} días`,
			class: 'text-gray-600',
		};
	}
};
