import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [AuthModule, PostsModule],
  controllers: [BlogsController],
})
export class BlogsModule {}
