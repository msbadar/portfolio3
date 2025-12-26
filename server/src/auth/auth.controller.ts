import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, JWTPayload } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    // In a JWT-based auth system, logout is typically handled client-side
    // by removing the token from storage
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: { user: JWTPayload }) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, user };
  }
}
