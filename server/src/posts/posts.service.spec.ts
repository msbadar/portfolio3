import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { DATABASE_CONNECTION } from '../db/database.module';

describe('PostsService', () => {
  let service: PostsService;
  let mockDb: {
    query: {
      users: { findFirst: jest.Mock };
      posts: { findFirst: jest.Mock };
      postLikes: { findFirst: jest.Mock };
    };
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    verified: true,
  };

  const mockPost = {
    id: 1,
    type: 'post',
    parentId: null,
    userId: 1,
    content: 'Test post content',
    image: null,
    title: null,
    excerpt: null,
    coverImage: null,
    readTime: null,
    category: null,
    likes: 5,
    comments: 2,
    reposts: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: { findFirst: jest.fn() },
        posts: { findFirst: jest.fn() },
        postLikes: { findFirst: jest.fn() },
      },
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPost]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockPost]),
          }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.create(
        { content: 'Test post content' },
        1,
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('post');
      expect(result.content).toBe('Test post content');
      expect(result.user.name).toBe(mockUser.name);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ content: 'Test content' }, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException for non-existent post', async () => {
      mockDb.query.posts.findFirst.mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockDb.query.posts.findFirst.mockResolvedValue({ ...mockPost, userId: 2 });

      await expect(service.delete(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createBlog', () => {
    it('should create a blog successfully', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            ...mockPost,
            type: 'blog',
            title: 'Test Blog',
            excerpt: 'Test excerpt',
            category: 'General',
            readTime: '1 min read',
          }]),
        }),
      });

      const result = await service.createBlog(
        {
          title: 'Test Blog',
          content: 'Test blog content',
          excerpt: 'Test excerpt',
        },
        1,
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('blog');
      expect(result.title).toBe('Test Blog');
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      mockDb.query.posts.findFirst.mockResolvedValue(mockPost);
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 2,
            type: 'comment',
            parentId: 1,
            content: 'Test comment',
            likes: 0,
            comments: 0,
            reposts: 0,
          }]),
        }),
      });
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await service.createComment(
        { parentId: 1, content: 'Test comment' },
        1,
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('comment');
      expect(result.parentId).toBe(1);
    });

    it('should throw NotFoundException for non-existent parent post', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      mockDb.query.posts.findFirst.mockResolvedValue(null);

      await expect(
        service.createComment({ parentId: 999, content: 'Test comment' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on a post', async () => {
      mockDb.query.posts.findFirst.mockResolvedValue(mockPost);
      mockDb.query.postLikes.findFirst.mockResolvedValue(null); // Not liked yet
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      });
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...mockPost, likes: 6 }]),
          }),
        }),
      });

      const result = await service.toggleLike(1, 1);

      expect(result.liked).toBe(true);
      expect(result.likes).toBe(6);
    });
  });
});
