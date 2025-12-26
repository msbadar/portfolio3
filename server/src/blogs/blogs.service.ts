import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc, and, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { blogs, blogLikes } from '../db/schema';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export interface BlogResponse {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  liked: boolean;
}

@Injectable()
export class BlogsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private calculateReadTime(content: string): string {
    const wordCount = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  }

  async findAll(userId?: number): Promise<BlogResponse[]> {
    const allBlogs = await this.db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.createdAt));

    const blogsWithLikeStatus = await Promise.all(
      allBlogs.map(async (blog) => {
        let liked = false;
        if (userId) {
          const like = await this.db.query.blogLikes.findFirst({
            where: and(
              eq(blogLikes.userId, userId),
              eq(blogLikes.blogId, blog.id),
            ),
          });
          liked = !!like;
        }

        const createdAt = blog.createdAt
          ? new Date(blog.createdAt)
          : new Date();

        return {
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt || '',
          content: blog.content,
          coverImage: blog.coverImage || '',
          readTime: blog.readTime || '5 min read',
          date: this.formatDate(createdAt),
          likes: blog.likes || 0,
          comments: blog.comments || 0,
          category: blog.category || 'General',
          liked,
        };
      }),
    );

    return blogsWithLikeStatus;
  }

  async findOne(id: number, userId?: number): Promise<BlogResponse> {
    const blog = await this.db.query.blogs.findFirst({
      where: eq(blogs.id, id),
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    let liked = false;
    if (userId) {
      const like = await this.db.query.blogLikes.findFirst({
        where: and(eq(blogLikes.userId, userId), eq(blogLikes.blogId, id)),
      });
      liked = !!like;
    }

    const createdAt = blog.createdAt ? new Date(blog.createdAt) : new Date();

    return {
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      coverImage: blog.coverImage || '',
      readTime: blog.readTime || '5 min read',
      date: this.formatDate(createdAt),
      likes: blog.likes || 0,
      comments: blog.comments || 0,
      category: blog.category || 'General',
      liked,
    };
  }

  async create(
    createBlogDto: CreateBlogDto,
    userId: number,
  ): Promise<BlogResponse> {
    const readTime = this.calculateReadTime(createBlogDto.content);

    const [newBlog] = await this.db
      .insert(blogs)
      .values({
        userId,
        title: createBlogDto.title.trim(),
        excerpt: createBlogDto.excerpt?.trim() || '',
        content: createBlogDto.content.trim(),
        coverImage: createBlogDto.coverImage || null,
        readTime,
        category: createBlogDto.category || 'General',
        likes: 0,
        comments: 0,
      })
      .returning();

    return {
      id: newBlog.id,
      title: newBlog.title,
      excerpt: newBlog.excerpt || '',
      content: newBlog.content,
      coverImage: newBlog.coverImage || '',
      readTime: newBlog.readTime || '5 min read',
      date: this.formatDate(new Date()),
      likes: newBlog.likes || 0,
      comments: newBlog.comments || 0,
      category: newBlog.category || 'General',
      liked: false,
    };
  }

  async update(
    id: number,
    updateBlogDto: UpdateBlogDto,
    userId: number,
  ): Promise<BlogResponse> {
    const existingBlog = await this.db.query.blogs.findFirst({
      where: eq(blogs.id, id),
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (existingBlog.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const readTime = this.calculateReadTime(updateBlogDto.content);

    const [updatedBlog] = await this.db
      .update(blogs)
      .set({
        title: updateBlogDto.title.trim(),
        excerpt: updateBlogDto.excerpt?.trim() || '',
        content: updateBlogDto.content.trim(),
        coverImage: updateBlogDto.coverImage || null,
        category: updateBlogDto.category || 'General',
        readTime,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();

    const date = this.formatDate(updatedBlog.createdAt || new Date());

    return {
      id: updatedBlog.id,
      title: updatedBlog.title,
      excerpt: updatedBlog.excerpt || '',
      content: updatedBlog.content,
      coverImage: updatedBlog.coverImage || '',
      readTime: updatedBlog.readTime || '5 min read',
      date,
      likes: updatedBlog.likes || 0,
      comments: updatedBlog.comments || 0,
      category: updatedBlog.category || 'General',
      liked: false,
    };
  }

  async delete(id: number, userId: number): Promise<void> {
    const existingBlog = await this.db.query.blogs.findFirst({
      where: eq(blogs.id, id),
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (existingBlog.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.db.delete(blogs).where(eq(blogs.id, id));
  }

  async toggleLike(
    id: number,
    userId: number,
  ): Promise<{ liked: boolean; likes: number }> {
    const blog = await this.db.query.blogs.findFirst({
      where: eq(blogs.id, id),
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const existingLike = await this.db.query.blogLikes.findFirst({
      where: and(eq(blogLikes.userId, userId), eq(blogLikes.blogId, id)),
    });

    let liked: boolean;
    let newLikesCount: number;

    if (existingLike) {
      // Unlike
      await this.db.delete(blogLikes).where(eq(blogLikes.id, existingLike.id));
      const [updatedBlog] = await this.db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} - 1` })
        .where(eq(blogs.id, id))
        .returning();
      liked = false;
      newLikesCount = updatedBlog.likes || 0;
    } else {
      // Like
      await this.db.insert(blogLikes).values({
        userId,
        blogId: id,
      });
      const [updatedBlog] = await this.db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} + 1` })
        .where(eq(blogs.id, id))
        .returning();
      liked = true;
      newLikesCount = updatedBlog.likes || 0;
    }

    return { liked, likes: newLikesCount };
  }
}
