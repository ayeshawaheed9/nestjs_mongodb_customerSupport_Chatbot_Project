import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}  // Inject UserService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if the session exists and if the user ID is stored in the session
    if (request.session && request.session.userId) {
      // Fetch the user from the database using the user ID stored in the session
      const user = await this.userService.getUserById(request.session.userId);

      // Check if the user exists and is logged in
      if (user && user.isloggedIn) {
        return true;  // Allow access if the user is logged in
      } else {
        throw new UnauthorizedException('User is not logged in');
      }
    } else {
      throw new UnauthorizedException('No session found');
    }
  }
}
