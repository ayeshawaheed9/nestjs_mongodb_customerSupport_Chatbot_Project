import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Payload, Ctx } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern()
    async getOrderUpdate(@Payload() message : any, @Ctx() context: RmqContext){
        console.log(message);
    }
}
