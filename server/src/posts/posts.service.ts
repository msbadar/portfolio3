import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc, and, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { posts, users, postLikes } from '../db/schema';
import { CreatePostDto, UpdatePostDto } from './dto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export interface PostResponse {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  liked: boolean;
}

@Injectable()
export class PostsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private calculateRelativeTime(createdAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours < 1
      ? 'now'
      : diffHours < 24
        ? `${diffHours}h`
        : `${Math.floor(diffHours / 24)}d`;
  }

  async findAll(userId?: number): Promise<PostResponse[]> {
    const allPosts = await this.db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        likes: posts.likes,
        comments: posts.comments,
        reposts: posts.reposts,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        userVerified: users.verified,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const postsWithLikeStatus = await Promise.all(
      allPosts.map(async (post) => {
        let liked = false;
        if (userId) {
          const like = await this.db.query.postLikes.findFirst({
            where: and(
              eq(postLikes.userId, userId),
              eq(postLikes.postId, post.id),
            ),
          });
          liked = !!like;
        }

        const createdAt = post.createdAt
          ? new Date(post.createdAt)
          : new Date();

        return {
          id: post.id,
          user: {
            name: post.userName || 'Anonymous',
            username: post.userUsername || 'anonymous',
            avatar: post.userAvatar || '',
            verified: post.userVerified || false,
          },
          content: post.content,
          image: post.image || undefined,
          likes: post.likes || 0,
          comments: post.comments || 0,
          reposts: post.reposts || 0,
          time: this.calculateRelativeTime(createdAt),
          liked,
        };
      }),
    );

    return postsWithLikeStatus;
  }

  async findOne(id: number, userId?: number): Promise<PostResponse> {
    const [post] = await this.db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        likes: posts.likes,
        comments: posts.comments,
        reposts: posts.reposts,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        userVerified: users.verified,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let liked = false;
    if (userId) {
      const like = await this.db.query.postLikes.findFirst({
        where: and(eq(postLikes.userId, userId), eq(postLikes.postId, id)),
      });
      liked = !!like;
    }

    const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();

    return {
      id: post.id,
      user: {
        name: post.userName || 'Anonymous',
        username: post.userUsername || 'anonymous',
        avatar: post.userAvatar || '',
        verified: post.userVerified || false,
      },
      content: post.content,
      image: post.image || undefined,
      likes: post.likes || 0,
      comments: post.comments || 0,
      reposts: post.reposts || 0,
      time: this.calculateRelativeTime(createdAt),
      liked,
    };
  }

  async create(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<PostResponse> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [newPost] = await this.db
      .insert(posts)
      .values({
        userId,
        content: createPostDto.content.trim(),
        image: createPostDto.image || null,
        likes: 0,
        comments: 0,
        reposts: 0,
      })
      .returning();

    return {
      id: newPost.id,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar || '',
        verified: user.verified || false,
      },
      content: newPost.content,
      image: newPost.image || undefined,
      likes: newPost.likes || 0,
      comments: newPost.comments || 0,
      reposts: newPost.reposts || 0,
      time: 'now',
      liked: false,
    };
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<{ id: number; content: string }> {
    const existingPost = await this.db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const [updatedPost] = await this.db
      .update(posts)
      .set({ content: updatePostDto.content.trim(), updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return { id: updatedPost.id, content: updatedPost.content };
  }

  async delete(id: number, userId: number): Promise<void> {
    const existingPost = await this.db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.db.delete(posts).where(eq(posts.id, id));
  }

  async toggleLike(
    id: number,
    userId: number,
  ): Promise<{ liked: boolean; likes: number }> {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.db.query.postLikes.findFirst({
      where: and(eq(postLikes.userId, userId), eq(postLikes.postId, id)),
    });

    let liked: boolean;
    let newLikesCount: number;

    if (existingLike) {
      // Unlike
      await this.db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
      const [updatedPost] = await this.db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, id))
        .returning();
      liked = false;
      newLikesCount = updatedPost.likes || 0;
    } else {
      // Like
      await this.db.insert(postLikes).values({
        userId,
        postId: id,
      });
      const [updatedPost] = await this.db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, id))
        .returning();
      liked = true;
      newLikesCount = updatedPost.likes || 0;
    }

    return { liked, likes: newLikesCount };
  }
}
