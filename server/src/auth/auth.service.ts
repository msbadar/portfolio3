import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { users } from '../db/schema';
import { LoginDto, RegisterDto } from './dto';
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
    if (
      !secret &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      throw new Error(
        'JWT_SECRET environment variable is required in production',
      );
    }
    return new TextEncoder().encode(
      secret || 'dev-secret-key-min-32-chars-long!',
    );
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
}
