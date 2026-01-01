import { Controller, Get } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import type { MetadataResponse } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  getMetadata(): MetadataResponse {
    return this.metadataService.getMetadata();
  }
}
