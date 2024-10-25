import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('AuthGuard: Checking session...');

    // Check if the session exists
    if (request.session) {
      console.log('AuthGuard: Session exists', request.session);

      // Check if the session has expired or is invalid
      if (request.session.userId) {
        console.log('AuthGuard: User ID found in session:', request.session.userId);
        const user = await this.userService.getUserById(request.session.userId);
        
        if (user) {
          console.log('AuthGuard: User found:', user);
          if (user.isloggedIn) {
            console.log('AuthGuard: User is logged in. Access granted.');
            return true; // User is logged in and session is active
          }
        }
      } 

      console.log('AuthGuard: No user ID found in session. Treating as guest.');
      return true; // Allow access as guest
    }
  }
}
