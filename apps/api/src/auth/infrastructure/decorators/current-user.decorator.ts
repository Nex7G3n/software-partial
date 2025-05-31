import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/common/types/user.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
	user: User;
}

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): User => {
		const request = ctx.switchToHttp().getRequest<RequestWithUser>();
		if (!request.user || typeof request.user !== 'object') {
			throw new Error('User not found in request');
		}
		const user = request.user;
		if (
			!user.id ||
			!user.email ||
			!user.name ||
			!Array.isArray(user.roles)
		) {
			throw new Error('Invalid user object in request');
		}
		return user;
	},
);
