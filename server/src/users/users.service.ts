import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, sql, ne, notInArray, desc, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { users, userFollows, sites, userSites } from '../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import type { UpdateUserDto } from './dto';

export interface SuggestionResponse {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  followers?: string;
  following?: string;
  link?: string;
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

  async getSuggestions(
    userId?: number,
    site?: string,
  ): Promise<SuggestionResponse[]> {
    let excludeIds: number[] = [];

    if (userId) {
      const followedUsers = await this.db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId));

      excludeIds = [userId, ...followedUsers.map((f) => f.followingId)];
    }

    // If site is provided, filter users by site
    let userIdsInSite: number[] | null = null;
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

        userIdsInSite = userSiteRecords.map((us) => us.userId);
      } else {
        // Site not found, return empty results
        userIdsInSite = [];
      }
    }

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [];

    // Exclude followed users and self
    if (excludeIds.length > 0) {
      conditions.push(notInArray(users.id, excludeIds));
    } else {
      conditions.push(ne(users.id, 0));
    }

    // Filter by site if provided
    if (userIdsInSite !== null) {
      if (userIdsInSite.length > 0) {
        conditions.push(inArray(users.id, userIdsInSite));
      } else {
        // No users in this site, return empty
        return [];
      }
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
      .where(and(...conditions))
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

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: Partial<typeof users.$inferInsert> = {};

    if (updateUserDto.name !== undefined) {
      const trimmedName = updateUserDto.name.trim();
      updateData.name = trimmedName || existingUser.name;
    }
    if (updateUserDto.bio !== undefined) {
      const trimmedBio = updateUserDto.bio.trim();
      updateData.bio = trimmedBio || null;
    }
    if (updateUserDto.link !== undefined) {
      const trimmedLink = updateUserDto.link.trim();
      updateData.link = trimmedLink || null;
    }
    if (updateUserDto.avatar !== undefined) {
      const trimmedAvatar = updateUserDto.avatar.trim();
      updateData.avatar = trimmedAvatar || null;
    }

    updateData.updatedAt = new Date();

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      username: updatedUser.username,
      avatar: updatedUser.avatar || '',
      verified: updatedUser.verified || false,
      bio: updatedUser.bio || undefined,
      followers: this.formatFollowers(updatedUser.followers || 0),
      following: this.formatFollowers(updatedUser.following || 0),
      link: updatedUser.link || undefined,
    };
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
