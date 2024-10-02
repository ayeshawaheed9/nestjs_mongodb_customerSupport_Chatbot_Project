import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Post, Get,Param, Body, UseInterceptors } from "@nestjs/common";
import { UserService } from "./users.service";
import { createUserDto } from "src/dtos/create-user.dto";

@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController{
    constructor(private readonly usersService: UserService){

    }
    @Post('/create_user')
    async createUser(@Body() user: createUserDto){
        return this.usersService.createUser(user);
    }

    @Get('/get_user/:username')
    async getUserbyName(@Param('username') username: string){
        return this.usersService.getUserByName(username);
    }
}