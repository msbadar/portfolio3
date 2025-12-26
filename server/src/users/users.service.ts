import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, sql, ne, notInArray, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { users, userFollows } from '../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export interface SuggestionResponse {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private formatFollowers(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  async getSuggestions(userId?: number): Promise<SuggestionResponse[]> {
    let excludeIds: number[] = [];

    if (userId) {
      const followedUsers = await this.db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId));

      excludeIds = [userId, ...followedUsers.map((f) => f.followingId)];
    }

    const suggestedUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        verified: users.verified,
        followers: users.followers,
      })
      .from(users)
      .where(
        excludeIds.length > 0
          ? notInArray(users.id, excludeIds)
          : ne(users.id, 0),
      )
      .orderBy(desc(users.followers))
      .limit(5);

    return suggestedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || '',
      verified: user.verified || false,
      followers: this.formatFollowers(user.followers || 0),
    }));
  }

  async toggleFollow(
    targetUserId: number,
    currentUserId: number,
  ): Promise<{ following: boolean }> {
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const targetUser = await this.db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, currentUserId),
        eq(userFollows.followingId, targetUserId),
      ),
    });

    let following: boolean;

    if (existingFollow) {
      // Unfollow
      await this.db
        .delete(userFollows)
        .where(eq(userFollows.id, existingFollow.id));

      // Update follower/following counts
      await this.db
        .update(users)
        .set({ following: sql`${users.following} - 1` })
        .where(eq(users.id, currentUserId));
      await this.db
        .update(users)
        .set({ followers: sql`${users.followers} - 1` })
        .where(eq(users.id, targetUserId));

      following = false;
    } else {
      // Follow
      await this.db.insert(userFollows).values({
        followerId: currentUserId,
        followingId: targetUserId,
      });

      // Update follower/following counts
      await this.db
        .update(users)
        .set({ following: sql`${users.following} + 1` })
        .where(eq(users.id, currentUserId));
      await this.db
        .update(users)
        .set({ followers: sql`${users.followers} + 1` })
        .where(eq(users.id, targetUserId));

      following = true;
    }

    return { following };
  }
}
