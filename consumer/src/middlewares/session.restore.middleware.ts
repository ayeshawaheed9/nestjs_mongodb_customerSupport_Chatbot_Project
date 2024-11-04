import { Injectable, Inject,NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Cache } from 'cache-manager'; // Assuming you're using a cache
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
@Injectable()
export class SessionRestoreMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache
) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // If session already has userId, skip restoring it
    console.log('In session restore middleware')
    if (req.session?.userId) {
      return next();
    }
    // Check the cache or any persistent store to restore session user ID
    const cachedUserId = await this.cacheManager.get<string>(`session:${req.sessionID}`);
    if (cachedUserId) {
      req.session.userId = cachedUserId; // Restore the userId in session
      console.log('Session restored with userId:', cachedUserId);
    }
    next(); // Continue to the next middleware or route handler
  }
}