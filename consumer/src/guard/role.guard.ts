import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConvBertForMaskedLM } from '@xenova/transformers';
import { User } from 'src/schemas/user.schema';
import { UserService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, 
    private readonly usersService: UserService
  ) {}

  async canActivate(context: ExecutionContext){
    // const requiredRole = this.reflector.get<string[]>('roles', context.getHandler());
    // if (!requiredRole) {
    //   return true; // If no roles are required, allow access
    // }

    const request = context.switchToHttp().getRequest();
    const userId= request.session.userId; // Assuming user is attached to request
    const user: User = await this.usersService.getUserById(userId); // Fetch user by ID from decoded token

    if (!user || !user.role) {
      throw new ForbiddenException('User not found or role not assigned');
    }

    // const hasRole = () => requiredRole.includes(user.role);
    // if (!hasRole()) {
    //   throw new ForbiddenException('You do not have permission to access this resource');
    // }
    if(user.role == 'admin'){
      console.log('access granted to admin')
        return true;
    }
    console.log('access not granted as user is not an admin')
    return false;
  }
}
