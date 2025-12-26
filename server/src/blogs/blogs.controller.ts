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
import { PostsService } from '../posts/posts.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { JwtAuthGuard, OptionalAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import { Site } from '../common/decorators/site.decorator';
import type { JWTPayload } from '../auth/auth.service';

// This controller provides backward-compatible /blogs endpoints
// All data is stored in the unified posts table with type='blog'
@Controller('blogs')
export class BlogsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @CurrentUser() user: JWTPayload | null,
    @Site() site: string | null,
  ) {
    const blogs = await this.postsService.findAllBlogs(
      user?.userId,
      site ?? undefined,
    );
    return { blogs };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload | null,
  ) {
    const blog = await this.postsService.findOne(id, user?.userId);
    return { blog };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const blog = await this.postsService.createBlog(createBlogDto, user.userId);
    return { blog };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const blog = await this.postsService.updateBlog(
      id,
      updateBlogDto,
      user.userId,
    );
    return { blog };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ) {
    await this.postsService.delete(id, user.userId);
    return { success: true };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.postsService.toggleLike(id, user.userId);
  }
}
