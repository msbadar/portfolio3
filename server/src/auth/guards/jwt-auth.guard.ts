import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService, JWTPayload } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string }; user?: JWTPayload }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const payload = await this.authService.verifyToken(token);

    if (!payload) {
      return false;
    }

    request.user = payload;
    return true;
  }
}
