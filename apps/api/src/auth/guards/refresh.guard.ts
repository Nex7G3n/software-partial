import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken: string =
      (request.cookies as { refresh_token?: string }).refresh_token || '';

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const user = await this.authService.validateRefreshToken(refreshToken);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  getRequest(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return request;
  }
}
