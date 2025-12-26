import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, OptionalAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import type { JWTPayload } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('suggestions')
  @UseGuards(OptionalAuthGuard)
  async getSuggestions(@CurrentUser() user: JWTPayload | null) {
    const suggestions = await this.usersService.getSuggestions(user?.userId);
    return { suggestions };
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.usersService.toggleFollow(id, user.userId);
  }
}
