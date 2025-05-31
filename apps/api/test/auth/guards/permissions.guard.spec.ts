// src/auth/guards/permissions.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
	// MOCK_PERMISSIONS_KEY is no longer needed if importing the actual key
	mockUserAdmin,
	mockUserEditor,
	mockUserRegular,
	mockUserGuest,
	mockUserNoRoles,
	mockUserMultipleRoles,
} from './mocks/permissions.guard.mocks'; // Adjust path
import { User } from 'src/common/types/user.interface';
import { PERMISSIONS_KEY } from 'src/auth/infrastructure/decorators/permissions.decorator';
import { Permission } from 'src/auth/domain/enums/permission.enum';
import { PermissionsGuard } from 'src/auth/infrastructure/guards/permissions.guard';
import { rolePermissions } from 'src/auth/infrastructure/configs/role-permissions.config';
import { Role } from 'src/auth/domain/enums/role.enum';

describe('PermissionsGuard', () => {
	let guard: PermissionsGuard;
	let mockReflector: jest.Mocked<Reflector>;

	// Helper to create ExecutionContext and set up Reflector mock for it
	const createMockExecutionContext = (
		user: User | undefined,
		requiredPermissionsValue?: Permission[], // The value Reflector should return for PERMISSIONS_KEY
	): ExecutionContext => {
		// Mock reflector to return the specified permissions for PERMISSIONS_KEY
		// This will apply to any call to getAllAndOverride within this test's scope
		// where the key matches PERMISSIONS_KEY.
		mockReflector.getAllAndOverride.mockImplementation((key) => {
			if (key === PERMISSIONS_KEY) {
				return requiredPermissionsValue; // Return undefined if requiredPermissionsValue is undefined
			}
			return undefined; // Default for other keys
		});

		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user }),
			}),
			getHandler: jest.fn(() => 'handler'), // Dummy function for target
			getClass: jest.fn(() => 'class'), // Dummy function for target
		} as unknown as ExecutionContext;

		return mockContext;
	};

	beforeEach(() => {
		// Create a fresh mock for Reflector before each test
		mockReflector = {
			getAllAndOverride: jest.fn(),
		} as unknown as jest.Mocked<Reflector>;

		guard = new PermissionsGuard(mockReflector);
	});

	afterEach(() => {
		jest.restoreAllMocks(); // Cleans up mocks between tests
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should allow access if no permissions are required by the route (reflector returns empty array)', () => {
		const context = createMockExecutionContext(mockUserRegular, []);
		expect(guard.canActivate(context)).toBe(true);
		expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);
	});

	it('should allow access if reflector returns undefined for required permissions', () => {
		const context = createMockExecutionContext(mockUserRegular, undefined);
		expect(guard.canActivate(context)).toBe(true);
		expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);
	});

	it('should deny access if user is not present in the request but permissions are required', () => {
		const context = createMockExecutionContext(undefined, [
			Permission.ARTICLE_CREATE,
		]);
		expect(guard.canActivate(context)).toBe(false);
	});

	it('should deny access if user has no roles but permissions are required', () => {
		const context = createMockExecutionContext(mockUserNoRoles, [
			Permission.ARTICLE_CREATE,
		]);
		expect(guard.canActivate(context)).toBe(false);
	});

	describe('User with specific roles and permissions', () => {
		// Using actual 'rolePermissions' imported from config
		it('should allow access if user (Admin) has all required permissions', () => {
			// Permissions an Admin definitely has according to your rolePermissions config
			const required = [
				Permission.USER_CREATE,
				Permission.ARTICLE_CREATE,
			];
			const context = createMockExecutionContext(mockUserAdmin, required);
			expect(guard.canActivate(context)).toBe(true);
		});

		it('should allow access if user (Editor) has a required permission (ARTICLE_UPDATE_ANY)', () => {
			const required = [Permission.ARTICLE_UPDATE_ANY];
			const context = createMockExecutionContext(
				mockUserEditor,
				required,
			);
			// Verify that EDITOR has ARTICLE_UPDATE_ANY in your actual rolePermissions config
			expect(
				rolePermissions[Role.EDITOR]?.includes(
					Permission.ARTICLE_UPDATE_ANY,
				),
			).toBe(true);
			expect(guard.canActivate(context)).toBe(true);
		});

		it('should deny access if user (Editor) lacks a required permission (USER_CREATE)', () => {
			const required = [Permission.USER_CREATE];
			const context = createMockExecutionContext(
				mockUserEditor,
				required,
			);
			expect(guard.canActivate(context)).toBe(false);
		});

		it('should allow access if user (Regular User) has the required permission (TASK_CREATE)', () => {
			const required = [Permission.TASK_CREATE];
			const context = createMockExecutionContext(
				mockUserRegular,
				required,
			);
			expect(
				rolePermissions[Role.USER]?.includes(Permission.TASK_CREATE),
			).toBe(true);
			expect(guard.canActivate(context)).toBe(true);
		});

		it('should deny access if user (Guest) lacks a required permission (ARTICLE_CREATE)', () => {
			const required = [Permission.ARTICLE_CREATE];
			const context = createMockExecutionContext(mockUserGuest, required);
			expect(guard.canActivate(context)).toBe(false);
		});

		it('should correctly aggregate permissions for a user with multiple roles (User + Editor)', () => {
			const required = [
				Permission.TASK_CREATE,
				Permission.ARTICLE_CREATE,
			];
			const context = createMockExecutionContext(
				mockUserMultipleRoles,
				required,
			);
			expect(guard.canActivate(context)).toBe(true);
		});

		it('should deny if user with multiple roles lacks one of the required permissions', () => {
			// User + Editor does not have USER_DELETE
			const required = [Permission.TASK_CREATE, Permission.USER_DELETE];
			const context = createMockExecutionContext(
				mockUserMultipleRoles,
				required,
			);
			expect(guard.canActivate(context)).toBe(false);
		});

		it('should handle roles not present in rolePermissions gracefully (empty permissions for that role)', () => {
			const mockUserWithUnknownRole: User = {
				id: 'unknown-role-user',
				email: 'u@e.c',
				name: 'U',
				roles: [Role.USER, 'UNKNOWN_ROLE_FOR_TEST' as Role],
			};
			// User has TASK_CREATE, UNKNOWN_ROLE_FOR_TEST has nothing from rolePermissions
			const required = [Permission.TASK_CREATE];
			const context = createMockExecutionContext(
				mockUserWithUnknownRole,
				required,
			);
			expect(guard.canActivate(context)).toBe(true);

			const requiredStrict = [Permission.USER_DELETE]; // Neither USER nor UNKNOWN_ROLE has this
			const contextStrict = createMockExecutionContext(
				mockUserWithUnknownRole,
				requiredStrict,
			);
			expect(guard.canActivate(contextStrict)).toBe(false);
		});
	});

	it('should call reflector with PERMISSIONS_KEY and context handlers', () => {
		const requiredPerms = [Permission.USER_CREATE];
		const context = createMockExecutionContext(
			mockUserAdmin,
			requiredPerms,
		);
		guard.canActivate(context); // This will trigger the mockReflector setup

		expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
			PERMISSIONS_KEY, // Using the actual imported key
			[context.getHandler(), context.getClass()],
		);
	});
});
