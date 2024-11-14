import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { UserHttpService } from './user.http.service';
import { createUserDto } from 'src/dtos/create-user.dto';
import { userloginDto } from 'src/dtos/user-login.dto';

@Controller('producer-users')
export class ProducerUserController {
  constructor(private readonly userHttpService: UserHttpService) {}

  @Post('create/:role')
  async createUser(@Body() user: createUserDto, @Param('role') role: string) {
    return this.userHttpService.createUser(user, role);
  }
  @Post('login/:role')
  async loginUser(
    @Body() loginCredentials: userloginDto,
    @Param('role') role: string,
    @Headers('Session-Id') sessionId: string,
  ) {
    return this.userHttpService.loginUser(loginCredentials, role, sessionId);
  }
  @Post('logout')
  async logout(@Headers('Session-Id') sessionId: string) {
    return this.userHttpService.logout(sessionId);
  }
}
