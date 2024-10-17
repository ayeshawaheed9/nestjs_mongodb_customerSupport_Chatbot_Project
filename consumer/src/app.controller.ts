import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Payload, Ctx } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { createRmqConnection } from './rmq.config';

@Controller()
export class AppController {
  public channel;
  constructor(private readonly appService: AppService,
  //  @Inject('ORDERS_SERVICE') public client: ClientProxy
  ) 
  {
    createRmqConnection().then((channel) =>{
      this.channel =channel;
    });
  }
  
  @MessagePattern()
  async consumemessage(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message received:', data);

    // Acknowledge the message to RabbitMQ
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
  // @MessagePattern()
  //   async getOrderUpdate(@Payload() message : any, @Ctx() context: RmqContext){
  //       console.log(message);
  //   }
}
