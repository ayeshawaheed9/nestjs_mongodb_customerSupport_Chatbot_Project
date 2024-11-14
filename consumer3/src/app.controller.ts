import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { EventPattern } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { createRmqConnection } from './rmq.config';

@Controller()
export class AppController {
  private channel;
  constructor() {
    createRmqConnection().then((channel) => {
      this.channel = channel;
    });
  }
  @EventPattern('eventType3')
  async consumemessage(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message received in consumer 3:', data);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
