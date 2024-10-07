import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Post, Get,Param, Body, UseInterceptors, Req } from "@nestjs/common";
import { UserService } from "./users.service";
import { createUserDto } from "src/dtos/create-user.dto";
import { userloginDto } from "src/dtos/user-login.dto";
@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController{
    constructor(private readonly usersService: UserService){

    }
    @Post('/create_user/:role')
    async createUser(@Body() user: createUserDto, @Param('role') role: string){
        return this.usersService.createUser(user, role);
    }
    @Post('/login_user/:role')
    async loginUser(@Body() loginCredentials: userloginDto,@Param('role') role: string, @Req() req:any){
        return this.usersService.loginUser(loginCredentials,role, req.session)
    }
    @Get('/get_user/:username')
    async getUserbyName(@Param('username') username: string){
        return this.usersService.getUserByName(username);
    }
    @Post('logout')
  async logout(@Req() req: any) {
    return this.usersService.logout(req.session);
  }
}