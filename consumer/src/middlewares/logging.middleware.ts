import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from 'src/loggingModule/logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId || 'guest';  // Get userId from session
    const action = `${req.method} ${req.originalUrl}`;
    const details = `IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`;

    // Log the activity
    await this.loggingService.logActivity(userId, action, details);

    next();  // Continue to the next middleware or route handler
  }
}
