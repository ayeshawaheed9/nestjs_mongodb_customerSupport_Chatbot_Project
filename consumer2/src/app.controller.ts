import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { EventPattern } from '@nestjs/microservices';
import { createRmqConnection } from './rmq.config';
@Controller()
export class AppController {
  public channel;
  constructor(private readonly appService: AppService) {
    createRmqConnection().then((channel) => {
      this.channel = channel;
    });
  }

  //without retry mechanism

  // @EventPattern('eventType2')
  // async consumemessage(@Payload() data: any, @Ctx() context: RmqContext) {
  //   console.log('Message received:', data);
  //   const channel = context.getChannelRef();
  //   const originalMessage = context.getMessage();
  //   channel.ack(originalMessage);
  // }

  //with retry mechanism

  @EventPattern('eventType2')
  async consumemessage(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const retryCount = originalMessage.properties.headers['x-retry-count'] || 0;

    try {
      if (data == null) {
        throw new Error('Data is null or undefined');
      }
      console.log('Processing message:', data);
    } catch (error) {
      console.error('Error processing message:', error.message);

      if (retryCount < 3) {
        console.log(`Retrying message. Retry count: ${retryCount + 1}`);
        await this.channel.publish(
          'topic_exchange',
          'billing.key',
          { pattern: 'eventType2', data },
          {
            persistent: true,
            headers: { 'x-retry-count': retryCount + 1 },
          },
        );
      } else {
        console.log('Max retries reached, sending to DLQ');
        channel.publish(
          'dlx_exchange',
          'failed_routing_key',
          originalMessage.content,
          { persistent: true },
        );
      }
    } finally {
      channel.ack(originalMessage);
    }
  }
}
