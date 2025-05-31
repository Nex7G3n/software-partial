import { Permission } from 'src/auth/enums/permission.enum';
import { Role } from 'src/auth/enums/role.enum';
import { User } from 'src/common/types/user.interface';

export const MOCK_PERMISSIONS_KEY = 'permissions';

// --- Mock User Data ---
export const mockUserAdmin: User = {
	id: 'admin-user-id',
	email: 'admin@example.com',
	name: 'Admin User',
	roles: [Role.ADMIN],
};

export const mockUserEditor: User = {
	id: 'editor-user-id',
	email: 'editor@example.com',
	name: 'Editor User',
	roles: [Role.EDITOR],
};

export const mockUserRegular: User = {
	id: 'user-id-123',
	email: 'user@example.com',
	name: 'Regular User',
	roles: [Role.USER],
};

export const mockUserGuest: User = {
	id: 'guest-user-id',
	email: 'guest@example.com',
	name: 'Guest User',
	roles: [Role.GUEST],
};

export const mockUserNoRoles: User = {
	id: 'no-roles-user-id',
	email: 'noroles@example.com',
	name: 'No Roles User',
	roles: [],
};

export const mockUserMultipleRoles: User = {
	id: 'multi-role-user-id',
	email: 'multirole@example.com',
	name: 'Multi Role User',
	roles: [Role.USER, Role.EDITOR],
};

// Note: Mock rolePermissions is not strictly needed if the spec file imports the actual config.
// It's included here for completeness if you ever need a test-specific override.
export const mockRolePermissionsConfig: Record<Role, Permission[]> = {
	[Role.ADMIN]: [
		Permission.USER_CREATE,
		Permission.USER_READ_ALL,
		Permission.USER_UPDATE,
		Permission.USER_DELETE,
		Permission.ARTICLE_CREATE,
		Permission.ARTICLE_READ_ALL,
		Permission.ARTICLE_UPDATE_ANY,
		Permission.ARTICLE_DELETE_ANY,
		Permission.SETTINGS_EDIT,
		Permission.TASK_READ_ANY_LIST, // Added a few more for completeness
	],
	[Role.EDITOR]: [
		Permission.ARTICLE_CREATE,
		Permission.ARTICLE_READ_ALL,
		Permission.ARTICLE_UPDATE_OWN,
		Permission.ARTICLE_DELETE_OWN,
		Permission.ARTICLE_UPDATE_ANY,
	],
	[Role.USER]: [
		Permission.ARTICLE_READ_ALL,
		Permission.ARTICLE_UPDATE_OWN,
		Permission.TASK_CREATE,
		Permission.TASK_READ_OWN_LIST,
	],
	[Role.GUEST]: [Permission.ARTICLE_READ_ALL, Permission.ARTICLE_READ_ONE],
};
