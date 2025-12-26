import { Module } from '@nestjs/common';
import { ActivityPubController } from './activitypub.controller';
import { ActivityPubService } from './activitypub.service';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityPubController],
  providers: [ActivityPubService],
  exports: [ActivityPubService],
})
export class ActivityPubModule {}
