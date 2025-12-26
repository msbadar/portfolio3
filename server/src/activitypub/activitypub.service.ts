import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, count } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { users, posts } from '../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../db/schema';
import {
  Actor,
  OrderedCollection,
  WebFingerResponse,
  NodeInfo,
  NodeInfoLinks,
  ACTIVITY_STREAMS_CONTEXT,
  SECURITY_CONTEXT,
  ActivityObject,
} from './activitypub.types';

@Injectable()
export class ActivityPubService {
  private readonly domain: string;
  private readonly protocol: string;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {
    this.domain = this.configService.get<string>('DOMAIN') || 'localhost:3001';
    this.protocol =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'https'
        : 'http';
  }

  getBaseUrl(): string {
    return `${this.protocol}://${this.domain}`;
  }

  private getActorUrl(username: string): string {
    return `${this.getBaseUrl()}/users/${username}`;
  }

  async getWebFinger(resource: string): Promise<WebFingerResponse | null> {
    // Parse acct:username@domain format
    const acctMatch = resource.match(/^acct:([^@]+)@(.+)$/);
    if (!acctMatch) {
      return null;
    }

    const [, username, resourceDomain] = acctMatch;
    if (resourceDomain !== this.domain) {
      return null;
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return null;
    }

    const actorUrl = this.getActorUrl(username);

    return {
      subject: `acct:${username}@${this.domain}`,
      aliases: [actorUrl],
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: actorUrl,
        },
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: `${this.getBaseUrl()}/profile/${username}`,
        },
      ],
    };
  }

  async getActor(username: string): Promise<Actor | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return null;
    }

    const actorUrl = this.getActorUrl(username);

    const actor: Actor = {
      '@context': [ACTIVITY_STREAMS_CONTEXT, SECURITY_CONTEXT],
      id: actorUrl,
      type: 'Person',
      preferredUsername: user.username,
      name: user.name,
      summary: user.bio || '',
      url: `${this.getBaseUrl()}/profile/${user.username}`,
      inbox: `${actorUrl}/inbox`,
      outbox: `${actorUrl}/outbox`,
      followers: `${actorUrl}/followers`,
      following: `${actorUrl}/following`,
      endpoints: {
        sharedInbox: `${this.getBaseUrl()}/inbox`,
      },
    };

    if (user.avatar) {
      actor.icon = {
        type: 'Image',
        mediaType: 'image/jpeg',
        url: user.avatar,
      };
    }

    return actor;
  }

  async getOutbox(
    username: string,
    page?: number,
  ): Promise<OrderedCollection | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return null;
    }

    const actorUrl = this.getActorUrl(username);
    const outboxUrl = `${actorUrl}/outbox`;

    // Get total count
    const [countResult] = await this.db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.userId, user.id));

    const totalItems = countResult?.value || 0;

    if (page === undefined) {
      // Return collection summary without items
      return {
        '@context': ACTIVITY_STREAMS_CONTEXT,
        id: outboxUrl,
        type: 'OrderedCollection',
        totalItems,
        first: `${outboxUrl}?page=1`,
        last: `${outboxUrl}?page=${Math.max(1, Math.ceil(totalItems / 20))}`,
      };
    }

    // Get paginated posts
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const userPosts = await this.db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(posts.createdAt)
      .limit(pageSize)
      .offset(offset);

    const orderedItems = userPosts.map((post) =>
      this.postToActivity(post, actorUrl),
    );

    return {
      '@context': ACTIVITY_STREAMS_CONTEXT,
      id: `${outboxUrl}?page=${page}`,
      type: 'OrderedCollection',
      totalItems,
      orderedItems,
    };
  }

  private postToActivity(
    post: typeof posts.$inferSelect,
    actorUrl: string,
  ): ActivityObject {
    const baseUrl = this.getBaseUrl();

    const object: ActivityObject = {
      id: `${baseUrl}/posts/${post.id}`,
      type: 'Note',
      content: post.content,
      published: post.createdAt?.toISOString(),
      attributedTo: actorUrl,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${actorUrl}/followers`],
      url: `${baseUrl}/posts/${post.id}`,
    };

    if (post.image) {
      object.attachment = [
        {
          type: 'Image',
          mediaType: 'image/jpeg',
          url: post.image,
        },
      ];
    }

    return object;
  }

  getNodeInfoLinks(): NodeInfoLinks {
    return {
      links: [
        {
          rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1',
          href: `${this.getBaseUrl()}/nodeinfo/2.1`,
        },
      ],
    };
  }

  async getNodeInfo(): Promise<NodeInfo> {
    const [userCount] = await this.db.select({ value: count() }).from(users);

    const [postCount] = await this.db.select({ value: count() }).from(posts);

    return {
      version: '2.1',
      software: {
        name: 'portfolio',
        version: '1.0.0',
      },
      protocols: ['activitypub'],
      usage: {
        users: {
          total: userCount?.value || 0,
        },
        localPosts: postCount?.value || 0,
      },
      openRegistrations: true,
      metadata: {},
    };
  }
}
