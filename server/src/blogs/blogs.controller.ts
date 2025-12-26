import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { JwtAuthGuard, OptionalAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import type { JWTPayload } from '../auth/auth.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@CurrentUser() user: JWTPayload | null) {
    const blogs = await this.blogsService.findAll(user?.userId);
    return { blogs };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload | null,
  ) {
    const blog = await this.blogsService.findOne(id, user?.userId);
    return { blog };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const blog = await this.blogsService.create(createBlogDto, user.userId);
    return { blog };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const blog = await this.blogsService.update(id, updateBlogDto, user.userId);
    return { blog };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ) {
    await this.blogsService.delete(id, user.userId);
    return { success: true };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.blogsService.toggleLike(id, user.userId);
  }
}
