import { Injectable } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import { createRmqConnection } from './rmq.config';
@Injectable()
export class AppService {
  private channel;
  async onModuleInit() {
    this.channel = await createRmqConnection();
   // this.consumeMessages();
  }
  // private consumeMessages() {
  //   this.channel.consume('billing_queue', (msg) => {
  //     if (msg) {
  //       const message = JSON.parse(msg.content.toString());
  //       console.log('Received message:', message);
  //       this.channel.ack(msg);
  //     }
  //   });
  // }

}
