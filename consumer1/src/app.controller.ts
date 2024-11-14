import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { EventPattern } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { createRmqConnection } from './rmq.config';
@Controller()
export class AppController {
  public channel;
  constructor(private readonly appService: AppService) {
    this.channel = createRmqConnection();
  }
  @EventPattern('eventType1')
  async consumemessage(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message received by consumer 1:', data);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
