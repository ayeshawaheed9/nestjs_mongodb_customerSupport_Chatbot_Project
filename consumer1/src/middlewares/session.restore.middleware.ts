import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Cache } from 'cache-manager'; 
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class SessionRestoreMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('In session restore middleware');
    const sessionId = Array.isArray(req.headers['x-session-id'])
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id']; 

    if (sessionId) {
      req.sessionID = sessionId as string; 
    }

    if (req.session?.userId) {
      return next();
    }

    const cachedUserId = await this.cacheManager.get<string>(`session:${req.sessionID}`);
    if (cachedUserId) {
      req.session.userId = cachedUserId; 
      console.log('Session restored with userId:', cachedUserId);
    }
    next(); 
  }
}
