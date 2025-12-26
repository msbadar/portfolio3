import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  NotFoundException,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ActivityPubService } from './activitypub.service';
import type { Activity } from './activitypub.types';

const ACTIVITY_JSON = 'application/activity+json';

@Controller()
export class ActivityPubController {
  constructor(private readonly activityPubService: ActivityPubService) {}

  @Get('.well-known/webfinger')
  async webfinger(@Query('resource') resource: string, @Res() res: Response) {
    if (!resource) {
      return res.status(400).json({ error: 'resource parameter is required' });
    }

    const result = await this.activityPubService.getWebFinger(resource);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return res.type('application/jrd+json').json(result);
  }

  @Get('.well-known/nodeinfo')
  nodeInfoLinks(@Res() res: Response) {
    const result = this.activityPubService.getNodeInfoLinks();
    return res.json(result);
  }

  @Get('nodeinfo/2.1')
  async nodeInfo(@Res() res: Response) {
    const result = await this.activityPubService.getNodeInfo();
    return res
      .type(
        'application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.1#"',
      )
      .json(result);
  }

  @Get('users/:username')
  async getActor(
    @Param('username') username: string,
    @Headers('accept') accept: string,
    @Res() res: Response,
  ) {
    // Check if the request accepts ActivityPub content types
    const acceptsActivityPub =
      accept?.includes(ACTIVITY_JSON) ||
      accept?.includes('application/ld+json') ||
      accept?.includes('application/json');

    if (!acceptsActivityPub) {
      // Redirect to profile page for HTML requests
      return res.redirect(`/profile/${username}`);
    }

    const actor = await this.activityPubService.getActor(username);

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    return res.type(ACTIVITY_JSON).json(actor);
  }

  @Get('users/:username/outbox')
  async getOutbox(
    @Param('username') username: string,
    @Query('page') page: string | undefined,
    @Res() res: Response,
  ) {
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const outbox = await this.activityPubService.getOutbox(
      username,
      pageNumber,
    );

    if (!outbox) {
      throw new NotFoundException('User not found');
    }

    return res.type(ACTIVITY_JSON).json(outbox);
  }

  @Post('users/:username/inbox')
  @HttpCode(HttpStatus.ACCEPTED)
  postToInbox(@Param('username') username: string, @Body() activity: Activity) {
    // Basic inbox endpoint - in a full implementation, this would:
    // 1. Verify HTTP signatures
    // 2. Process the activity (Follow, Like, Create, etc.)
    // 3. Store in database
    // 4. Send appropriate responses

    // For now, acknowledge receipt
    console.log(`Received activity for ${username}:`, activity.type);

    return { status: 'accepted' };
  }

  @Post('inbox')
  @HttpCode(HttpStatus.ACCEPTED)
  postToSharedInbox(@Body() activity: Activity) {
    // Shared inbox for server-wide activities
    console.log('Received shared inbox activity:', activity.type);

    return { status: 'accepted' };
  }

  @Get('users/:username/followers')
  getFollowers(@Param('username') username: string, @Res() res: Response) {
    // Returns an empty collection for now
    // In a full implementation, this would return federated followers
    const baseUrl = this.activityPubService['getBaseUrl']?.() || '';
    const actorUrl = `${baseUrl}/users/${username}`;

    return res.type(ACTIVITY_JSON).json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${actorUrl}/followers`,
      type: 'OrderedCollection',
      totalItems: 0,
      orderedItems: [],
    });
  }

  @Get('users/:username/following')
  getFollowing(@Param('username') username: string, @Res() res: Response) {
    // Returns an empty collection for now
    const baseUrl = this.activityPubService['getBaseUrl']?.() || '';
    const actorUrl = `${baseUrl}/users/${username}`;

    return res.type(ACTIVITY_JSON).json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${actorUrl}/following`,
      type: 'OrderedCollection',
      totalItems: 0,
      orderedItems: [],
    });
  }
}
