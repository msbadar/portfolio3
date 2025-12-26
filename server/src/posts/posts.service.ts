import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc, and, sql, inArray, or, like, SQL } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { posts, users, postLikes, sites, userSites } from '../db/schema';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDto,
  FilterPostsDto,
} from './dto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export type PostType = 'post' | 'blog' | 'comment';

export interface PostResponse {
  id: number;
  type: PostType;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  // Blog-specific fields
  title?: string;
  excerpt?: string;
  coverImage?: string;
  readTime?: string;
  category?: string;
  date?: string;
  // Comment-specific fields
  parentId?: number;
  // Engagement metrics
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  liked: boolean;
}

// Average words per minute for reading time calculation
const WORDS_PER_MINUTE = 200;

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

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private calculateReadTime(content: string): string {
    const wordCount = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))} min read`;
  }

  private async mapPostToResponse(
    post: {
      id: number;
      type: string | null;
      parentId: number | null;
      content: string;
      image: string | null;
      title: string | null;
      excerpt: string | null;
      coverImage: string | null;
      readTime: string | null;
      category: string | null;
      likes: number | null;
      comments: number | null;
      reposts: number | null;
      createdAt: Date | null;
      userName: string | null;
      userUsername: string | null;
      userAvatar: string | null;
      userVerified: boolean | null;
    },
    userId?: number,
  ): Promise<PostResponse> {
    let liked = false;
    if (userId) {
      const like = await this.db.query.postLikes.findFirst({
        where: and(eq(postLikes.userId, userId), eq(postLikes.postId, post.id)),
      });
      liked = !!like;
    }

    const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
    const type = (post.type || 'post') as PostType;

    return {
      id: post.id,
      type,
      user: {
        name: post.userName || 'Anonymous',
        username: post.userUsername || 'anonymous',
        avatar: post.userAvatar || '',
        verified: post.userVerified || false,
      },
      content: post.content,
      image: post.image || undefined,
      // Blog-specific fields
      title: post.title || undefined,
      excerpt: post.excerpt || undefined,
      coverImage: post.coverImage || undefined,
      readTime: post.readTime || undefined,
      category: post.category || undefined,
      date: type === 'blog' ? this.formatDate(createdAt) : undefined,
      // Comment-specific fields
      parentId: post.parentId || undefined,
      // Engagement metrics
      likes: post.likes || 0,
      comments: post.comments || 0,
      reposts: post.reposts || 0,
      time: this.calculateRelativeTime(createdAt),
      liked,
    };
  }

  // ==================== POSTS (type='post') ====================

  async findAll(
    userId?: number,
    site?: string,
    filters?: FilterPostsDto,
  ): Promise<PostResponse[]> {
    // Build where conditions
    const conditions: SQL<unknown>[] = [];

    // Type filter
    if (filters?.type) {
      // Specific type requested
      conditions.push(eq(posts.type, filters.type));
    } else {
      // Default: exclude comments, include posts and blogs
      conditions.push(inArray(posts.type, ['post', 'blog']));
    }

    // Category filter (for blogs)
    if (filters?.category) {
      conditions.push(eq(posts.category, filters.category));
    }

    // Search filter (search in content, title, excerpt)
    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      const searchCondition = or(
        like(posts.content, searchPattern),
        like(posts.title, searchPattern),
        like(posts.excerpt, searchPattern),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Filter by site if provided
    if (site) {
      // First, find the site ID
      const siteRecord = await this.db.query.sites.findFirst({
        where: eq(sites.name, site),
      });

      if (siteRecord) {
        // Get all user IDs associated with this site
        const userSiteRecords = await this.db
          .select({ userId: userSites.userId })
          .from(userSites)
          .where(eq(userSites.siteId, siteRecord.id));

        const userIdsInSite = userSiteRecords.map((us) => us.userId);

        if (userIdsInSite.length > 0) {
          conditions.push(inArray(posts.userId, userIdsInSite));
        } else {
          // No users in this site, return empty
          return [];
        }
      } else {
        // Site not found, return empty
        return [];
      }
    }

    // Build query with pagination
    const baseQuery = this.db
      .select({
        id: posts.id,
        type: posts.type,
        parentId: posts.parentId,
        content: posts.content,
        image: posts.image,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readTime: posts.readTime,
        category: posts.category,
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
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .$dynamic();

    // Apply pagination
    const allPosts = await (filters?.limit
      ? baseQuery.limit(filters.limit).offset(filters?.offset || 0)
      : baseQuery);

    return Promise.all(
      allPosts.map((post) => this.mapPostToResponse(post, userId)),
    );
  }

  async findOne(id: number, userId?: number): Promise<PostResponse> {
    const [post] = await this.db
      .select({
        id: posts.id,
        type: posts.type,
        parentId: posts.parentId,
        content: posts.content,
        image: posts.image,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readTime: posts.readTime,
        category: posts.category,
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

    return this.mapPostToResponse(post, userId);
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
        type: 'post',
        content: createPostDto.content.trim(),
        image: createPostDto.image || null,
        likes: 0,
        comments: 0,
        reposts: 0,
      })
      .returning();

    return {
      id: newPost.id,
      type: 'post',
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

  // ==================== BLOGS (type='blog') ====================

  async findAllBlogs(userId?: number, site?: string): Promise<PostResponse[]> {
    // Build where conditions
    const conditions = [eq(posts.type, 'blog')];

    // Filter by site if provided
    if (site) {
      // First, find the site ID
      const siteRecord = await this.db.query.sites.findFirst({
        where: eq(sites.name, site),
      });

      if (siteRecord) {
        // Get all user IDs associated with this site
        const userSiteRecords = await this.db
          .select({ userId: userSites.userId })
          .from(userSites)
          .where(eq(userSites.siteId, siteRecord.id));

        const userIdsInSite = userSiteRecords.map((us) => us.userId);

        if (userIdsInSite.length > 0) {
          conditions.push(inArray(posts.userId, userIdsInSite));
        } else {
          // No users in this site, return empty
          return [];
        }
      } else {
        // Site not found, return empty
        return [];
      }
    }

    const allBlogs = await this.db
      .select({
        id: posts.id,
        type: posts.type,
        parentId: posts.parentId,
        content: posts.content,
        image: posts.image,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readTime: posts.readTime,
        category: posts.category,
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
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt));

    return Promise.all(
      allBlogs.map((post) => this.mapPostToResponse(post, userId)),
    );
  }

  async createBlog(
    createBlogDto: CreateBlogDto,
    userId: number,
  ): Promise<PostResponse> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const readTime = this.calculateReadTime(createBlogDto.content);

    const [newBlog] = await this.db
      .insert(posts)
      .values({
        userId,
        type: 'blog',
        content: createBlogDto.content.trim(),
        title: createBlogDto.title.trim(),
        excerpt: createBlogDto.excerpt?.trim() || null,
        coverImage: createBlogDto.coverImage || null,
        readTime,
        category: createBlogDto.category || 'General',
        likes: 0,
        comments: 0,
        reposts: 0,
      })
      .returning();

    return {
      id: newBlog.id,
      type: 'blog',
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar || '',
        verified: user.verified || false,
      },
      content: newBlog.content,
      title: newBlog.title || undefined,
      excerpt: newBlog.excerpt || undefined,
      coverImage: newBlog.coverImage || undefined,
      readTime: newBlog.readTime || undefined,
      category: newBlog.category || undefined,
      date: this.formatDate(new Date()),
      likes: newBlog.likes || 0,
      comments: newBlog.comments || 0,
      reposts: newBlog.reposts || 0,
      time: 'now',
      liked: false,
    };
  }

  async updateBlog(
    id: number,
    updateBlogDto: UpdateBlogDto,
    userId: number,
  ): Promise<PostResponse> {
    const existingBlog = await this.db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.type, 'blog')),
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (existingBlog.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const readTime = this.calculateReadTime(updateBlogDto.content);

    const [updatedBlog] = await this.db
      .update(posts)
      .set({
        title: updateBlogDto.title.trim(),
        excerpt: updateBlogDto.excerpt?.trim() || null,
        content: updateBlogDto.content.trim(),
        coverImage: updateBlogDto.coverImage || null,
        category: updateBlogDto.category || 'General',
        readTime,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return {
      id: updatedBlog.id,
      type: 'blog',
      user: {
        name: user?.name || 'Anonymous',
        username: user?.username || 'anonymous',
        avatar: user?.avatar || '',
        verified: user?.verified || false,
      },
      content: updatedBlog.content,
      title: updatedBlog.title || undefined,
      excerpt: updatedBlog.excerpt || undefined,
      coverImage: updatedBlog.coverImage || undefined,
      readTime: updatedBlog.readTime || undefined,
      category: updatedBlog.category || undefined,
      date: this.formatDate(updatedBlog.createdAt || new Date()),
      likes: updatedBlog.likes || 0,
      comments: updatedBlog.comments || 0,
      reposts: updatedBlog.reposts || 0,
      time: this.calculateRelativeTime(updatedBlog.createdAt || new Date()),
      liked: false,
    };
  }

  // ==================== COMMENTS (type='comment') ====================

  async findComments(
    parentId: number,
    userId?: number,
  ): Promise<PostResponse[]> {
    const allComments = await this.db
      .select({
        id: posts.id,
        type: posts.type,
        parentId: posts.parentId,
        content: posts.content,
        image: posts.image,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readTime: posts.readTime,
        category: posts.category,
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
      .where(and(eq(posts.type, 'comment'), eq(posts.parentId, parentId)))
      .orderBy(desc(posts.createdAt));

    return Promise.all(
      allComments.map((post) => this.mapPostToResponse(post, userId)),
    );
  }

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<PostResponse> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify parent post exists
    const parentPost = await this.db.query.posts.findFirst({
      where: eq(posts.id, createCommentDto.parentId),
    });

    if (!parentPost) {
      throw new NotFoundException('Parent post not found');
    }

    const [newComment] = await this.db
      .insert(posts)
      .values({
        userId,
        type: 'comment',
        parentId: createCommentDto.parentId,
        content: createCommentDto.content.trim(),
        likes: 0,
        comments: 0,
        reposts: 0,
      })
      .returning();

    // Increment comments count on parent post
    await this.db
      .update(posts)
      .set({ comments: sql`${posts.comments} + 1` })
      .where(eq(posts.id, createCommentDto.parentId));

    return {
      id: newComment.id,
      type: 'comment',
      parentId: newComment.parentId || undefined,
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar || '',
        verified: user.verified || false,
      },
      content: newComment.content,
      likes: newComment.likes || 0,
      comments: newComment.comments || 0,
      reposts: newComment.reposts || 0,
      time: 'now',
      liked: false,
    };
  }
}
