import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithSite {
  site?: string;
}

export const Site = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithSite>();
    return request.site || null;
  },
);
