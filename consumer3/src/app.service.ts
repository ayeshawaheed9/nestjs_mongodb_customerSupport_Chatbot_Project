import { Injectable } from '@nestjs/common';
import { createRmqConnection } from './rmq.config';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
@Injectable()
export class AppService {
  private channel;
  async onModuleInit() {
    this.channel = await createRmqConnection();
    // this.consumeMessages();
  }
  // private consumeMessages() {
  //   this.channel.consume('notifications_queue', (msg) => {
  //     if (msg) {
  //       const message = JSON.parse(msg.content.toString());
  //       console.log('Received message:', message);
  //       this.channel.ack(msg);
  //     }
  //   });
  // }

  @EventPattern('consumer3')
  async consumeMessage(@Payload() payload: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log('Received message in consumer 3', payload);
    channel.ack(originalMsg);
  }

  // @EventPattern('eventType3')
  // async handleEventType1(@Payload() data: any, @Ctx() context: RmqContext) {
  //   const channel = context.getChannelRef();
  //   const originalMsg = context.getMessage();
  //   console.log('Consumer for eventType3 received message:', data);
  //   channel.ack(originalMsg);
  // }
}
