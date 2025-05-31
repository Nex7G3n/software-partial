import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
	constructor() {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await super.canActivate(context);
		const request = context.switchToHttp().getRequest<Request>();
		return request.user ? true : false;
	}
}
