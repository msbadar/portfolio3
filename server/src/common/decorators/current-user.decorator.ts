import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JWTPayload } from '../../auth/auth.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JWTPayload | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: JWTPayload | null }>();
    return request.user ?? null;
  },
);
