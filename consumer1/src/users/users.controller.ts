import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { UserService } from './users.service';
import { createUserDto } from 'src/dtos/create-user.dto';
import { userloginDto } from 'src/dtos/user-login.dto';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthGuard } from '@guard/auth.guard';
import { BadRequestException } from '@nestjs/common';
import { TwilioService } from './twilio.service';
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly usersService: UserService, 
    private readonly twilioservice: TwilioService
  ) {}
  @Post('/create_user/:role')
  async createUser(@Body() user: createUserDto, @Param('role') role: string) {
    return this.usersService.createUser(user, role);
  }
  @Post('/login_user/:role')
  async loginUser(
    @Body() loginCredentials: userloginDto,
    @Param('role') role: string,
    @Req() req: any,
  ) {
    return this.usersService.loginUser(loginCredentials, role, req.session);
  }
  @Get('/get_user/:username')
  async getUserbyName(
    @Param('username') username: string,
  ): Promise<UserDocument | null> {
    return this.usersService.getUserByName(username);
  }
  @Post('logout')
  async logout(@Req() req: any) {
    return this.usersService.logout(req.session);
  }
  @Post('request_otp')
  async requestOtp(@Body('phoneNumber') phoneNumber: number) {
    return this.twilioservice.sendOtp(phoneNumber);
  }

  @Post('verify_otp')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: number,
    @Body('otp') otp: string,
  ) {
    return this.usersService.verifyOtp(phoneNumber, otp);
  }

  @Post('reset_password')
  async resetPassword(
    @Body('phoneNumber') phoneNumber: number,
    @Body('newPassword') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    return this.usersService.resetPassword(phoneNumber, newPassword);
  }
}