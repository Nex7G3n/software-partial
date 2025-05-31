export const mockRequest = (user = null, cookies = {}) => ({
	user,
	cookies,
});

export const createMockResponse = () => {
	const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
		redirect: jest.fn().mockReturnThis(),
		cookie: jest.fn().mockReturnThis(),
		clearCookie: jest.fn().mockReturnThis(),
	};
	return res;
};
