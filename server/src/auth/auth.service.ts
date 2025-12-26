import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { eq, or, and, gt } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { users, passwordResetTokens } from '../db/schema';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export interface JWTPayload {
  userId: number;
  email: string;
  exp: number;
  iat: number;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  username: string;
  avatar: string | null;
  verified: boolean;
  bio: string | null;
  followers: number;
  following: number;
  link: string | null;
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  private getJwtSecret(): Uint8Array {
    const secret = this.configService.get<string>('JWT_SECRET');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (!secret) {
      if (nodeEnv === 'production') {
        throw new Error(
          'JWT_SECRET environment variable is required in production',
        );
      }
      // Development-only fallback with a warning
      console.warn(
        'WARNING: Using development fallback JWT secret. Set JWT_SECRET environment variable for production.',
      );
      return new TextEncoder().encode('dev-secret-key-min-32-chars-long!');
    }
    return new TextEncoder().encode(secret);
  }

  async createToken(userId: number, email: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + Math.floor(SESSION_DURATION / 1000);

    const token = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(this.getJwtSecret());

    return token;
  }

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.getJwtSecret());
      return payload as unknown as JWTPayload;
    } catch {
      return null;
    }
  }

  formatAuthUser(dbUser: {
    id: number;
    email: string;
    name: string;
    username: string;
    avatar: string | null;
    verified: boolean | null;
    bio: string | null;
    followers: number | null;
    following: number | null;
    link: string | null;
  }): AuthUser {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      username: dbUser.username,
      avatar: dbUser.avatar,
      verified: dbUser.verified || false,
      bio: dbUser.bio,
      followers: dbUser.followers || 0,
      following: dbUser.following || 0,
      link: dbUser.link,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = loginDto;

    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.createToken(user.id, user.email);

    return {
      user: this.formatAuthUser(user),
      token,
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: AuthUser; token: string }> {
    const { email, password, name, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      throw new UnauthorizedException(`${field} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        username,
        avatar: null,
        verified: false,
        bio: '',
        followers: 0,
        following: 0,
      })
      .returning();

    const token = await this.createToken(newUser.id, newUser.email);

    return {
      user: this.formatAuthUser(newUser),
      token,
    };
  }

  async getCurrentUser(userId: number): Promise<AuthUser | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    return this.formatAuthUser(user);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Always return success message to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Generate a secure random token
    const resetToken = randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing reset tokens for this user
    await this.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt,
      used: false,
    });

    // In a production app, you would send an email here
    // For now, we return the token in the response (only in development)
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv !== 'production') {
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
        resetToken,
      };
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;

    // Find the reset token
    const resetTokenRecord = await this.db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    });

    if (!resetTokenRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, resetTokenRecord.userId));

    // Mark the token as used
    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetTokenRecord.id));
  }
}
