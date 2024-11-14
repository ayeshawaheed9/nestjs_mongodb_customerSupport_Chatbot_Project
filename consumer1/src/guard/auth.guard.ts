import { Injectable, CanActivate,Inject, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('AuthGuard: Checking session...');
    const sessionId = Array.isArray(request.headers['x-session-id'])
      ? request.headers['x-session-id'][0]
      : request.headers['x-session-id'];

    if (sessionId) {
      request.sessionID = sessionId as string;
    }
    if (request.session?.userId) {
      console.log(
        'AuthGuard: User ID found in session:',
        request.session.userId,
      );

      const user = await this.userService.getUserById(request.session.userId);
      if (user && user.isloggedIn) {
        console.log('AuthGuard: User is logged in. Access granted.');
        return true;
      }
    }

    // If no userId in session, check if session can be restored
    console.log(
      'AuthGuard: No user ID found in session. Attempting to restore session...',
    );
    const cachedUserId = await this.cacheManager.get<string>(
      `session:${request.sessionID}`,
    );
    if (cachedUserId) {
      request.session.userId = cachedUserId;
      console.log('AuthGuard: Session restored with userId:', cachedUserId);

      const user = await this.userService.getUserById(cachedUserId);
      if (user && user.isloggedIn) {
        console.log(
          'AuthGuard: Restored session, user is logged in. Access granted.',
        );
        return true;
      }
    }

    console.log('AuthGuard: No user ID found in session. Treating as guest.');
    return true;
  }
}
