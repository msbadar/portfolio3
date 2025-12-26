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
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto';
import { JwtAuthGuard, OptionalAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import type { JWTPayload } from '../auth/auth.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ==================== POSTS (type='post') ====================

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@CurrentUser() user: JWTPayload | null) {
    const posts = await this.postsService.findAll(user?.userId);
    return { posts };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload | null,
  ) {
    const post = await this.postsService.findOne(id, user?.userId);
    return { post };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const post = await this.postsService.create(createPostDto, user.userId);
    return { post };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const post = await this.postsService.update(id, updatePostDto, user.userId);
    return { post };
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

  // ==================== COMMENTS (type='comment') ====================

  @Get(':id/comments')
  @UseGuards(OptionalAuthGuard)
  async findComments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload | null,
  ) {
    const comments = await this.postsService.findComments(id, user?.userId);
    return { comments };
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JWTPayload,
  ) {
    const comment = await this.postsService.createComment(
      createCommentDto,
      user.userId,
    );
    return { comment };
  }
}
