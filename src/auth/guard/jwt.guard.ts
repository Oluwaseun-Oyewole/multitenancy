import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException(
        'Your session has expired. Please log in again.',
      );
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token. Please log in again.');
    }

    if (err || !user) {
      throw err ?? new UnauthorizedException('Authentication required.');
    }

    return user;
  }
}
