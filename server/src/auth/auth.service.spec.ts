import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DATABASE_CONNECTION } from '../db/database.module';

describe('AuthService', () => {
  let service: AuthService;
  let mockDb: {
    query: {
      users: { findFirst: jest.Mock };
      passwordResetTokens: { findFirst: jest.Mock };
    };
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: {
          findFirst: jest.fn(),
        },
        passwordResetTokens: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              username: 'testuser',
              avatar: null,
              verified: false,
              bio: '',
              followers: 0,
              following: 0,
              link: null,
            },
          ]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key-min-32-chars-long!';
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'invalid@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return success message even for non-existent email', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result.message).toContain('If an account exists with this email');
    });

    it('should create reset token for existing user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const result = await service.forgotPassword({
        email: 'test@example.com',
      });

      expect(result.message).toContain('If an account exists with this email');
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException for invalid token', async () => {
      mockDb.query.passwordResetTokens.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          password: 'newpassword',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password for valid token', async () => {
      mockDb.query.passwordResetTokens.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'valid-token',
        used: false,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      await service.resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      expect(mockDb.update).toHaveBeenCalledTimes(2); // Once for user, once for token
    });
  });
});
