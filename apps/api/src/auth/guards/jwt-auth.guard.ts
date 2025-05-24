import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../common/types/user.interface';
import { JwtPayload } from '../../common/types/jwt-payload.interface';
import { Request } from 'express';
import { Role } from '../enums/role.enum';

interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const passportResult = await super.canActivate(context);
    if (passportResult) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      console.log('JWT Payload:', payload);
      (request as AuthenticatedRequest).user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles as Role[],
      };
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
