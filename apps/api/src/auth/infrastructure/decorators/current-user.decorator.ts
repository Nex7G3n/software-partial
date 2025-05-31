import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/common/types/user.interface';

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): User => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);
