import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from 'src/token/token.service';
import { TenantRequest } from '../middleware/tenant.middleware';

export const CurrentTenant = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<TenantRequest>();
    return req.tenant;
  },
);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
    return req.user;
  },
);
