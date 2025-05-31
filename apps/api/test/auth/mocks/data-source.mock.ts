export const mockQueryRunner = {
	connect: jest.fn(),
	startTransaction: jest.fn(),
	commitTransaction: jest.fn(),
	rollbackTransaction: jest.fn(),
	release: jest.fn(),
	manager: {
		findOne: jest.fn(),
		save: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
};

export const mockDataSource = {
	createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};
