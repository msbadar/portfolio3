import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithSite extends Request {
  site?: string | null;
}

@Injectable()
export class SiteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract site from X-Site header
    const site = req.get('X-Site') || null;

    // Attach site to request object for use in controllers/services
    (req as RequestWithSite).site = site;

    next();
  }
}
