import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService, JWTPayload } from '../auth.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JWTPayload | null;
    }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);
    const payload = await this.authService.verifyToken(token);
    request.user = payload;
    return true;
  }
}
