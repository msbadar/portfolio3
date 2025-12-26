import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ActivityPubService } from './activitypub.service';
import { DATABASE_CONNECTION } from '../db/database.module';

describe('ActivityPubService', () => {
  let service: ActivityPubService;
  const mockDb = {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockResolvedValue([]),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DOMAIN') return 'example.com';
      if (key === 'NODE_ENV') return 'production';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityPubService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ActivityPubService>(ActivityPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWebFinger', () => {
    it('should return null for invalid resource format', async () => {
      const result = await service.getWebFinger('invalid');
      expect(result).toBeNull();
    });

    it('should return null for wrong domain', async () => {
      const result = await service.getWebFinger('acct:user@wrong.com');
      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockDb.query.users.findFirst.mockResolvedValueOnce(null);
      const result = await service.getWebFinger('acct:testuser@example.com');
      expect(result).toBeNull();
    });

    it('should return WebFinger response for valid user', async () => {
      mockDb.query.users.findFirst.mockResolvedValueOnce({
        id: 1,
        username: 'testuser',
        name: 'Test User',
      });

      const result = await service.getWebFinger('acct:testuser@example.com');

      expect(result).not.toBeNull();
      expect(result?.subject).toBe('acct:testuser@example.com');
      expect(result?.links).toHaveLength(2);
      expect(result?.links[0].rel).toBe('self');
      expect(result?.links[0].type).toBe('application/activity+json');
    });
  });

  describe('getActor', () => {
    it('should return null for non-existent user', async () => {
      mockDb.query.users.findFirst.mockResolvedValueOnce(null);
      const result = await service.getActor('nonexistent');
      expect(result).toBeNull();
    });

    it('should return Actor object for valid user', async () => {
      mockDb.query.users.findFirst.mockResolvedValueOnce({
        id: 1,
        username: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        avatar: 'https://example.com/avatar.jpg',
      });

      const result = await service.getActor('testuser');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('Person');
      expect(result?.preferredUsername).toBe('testuser');
      expect(result?.name).toBe('Test User');
      expect(result?.inbox).toContain('/inbox');
      expect(result?.outbox).toContain('/outbox');
      expect(result?.icon).toBeDefined();
    });
  });

  describe('getNodeInfoLinks', () => {
    it('should return NodeInfo links', () => {
      const result = service.getNodeInfoLinks();

      expect(result.links).toHaveLength(1);
      expect(result.links[0].rel).toBe(
        'http://nodeinfo.diaspora.software/ns/schema/2.1',
      );
    });
  });

  describe('getNodeInfo', () => {
    it('should return NodeInfo object', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([{ value: 10 }]),
      });

      const result = await service.getNodeInfo();

      expect(result.version).toBe('2.1');
      expect(result.software.name).toBe('portfolio');
      expect(result.protocols).toContain('activitypub');
    });
  });
});
