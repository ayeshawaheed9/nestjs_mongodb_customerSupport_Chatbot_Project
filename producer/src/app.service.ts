import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { createRmqConnection } from './config/rmq.config';
@Injectable()
export class AppService {
  public channel;
  async onModuleInit() {
    try {
      this.channel = await createRmqConnection();
      console.log('RabbitMQ channel initialized');
    } catch (error) {
      console.error('Error initializing RabbitMQ channel:', error);
    }
  }

  async publishMessage(pattern: string, message: any) {
    if (!this.channel) {
      console.error('Channel not initialized');
      return;
    }
    const exchange = 'fanout_exchange';

    const payload = {
      data: message,
    };
    try {
      await this.channel.publish(exchange, '', payload);
      console.log('Message published to fanout exchange:', message);
    } catch (error) {
      console.error('Failed to publish message:', error);
    }
  }

  async publishEvent(pattern: string, data: any) {
    const message = {
      pattern: pattern,
      data: data,
    };

    await this.channel.publish(
      'fanout_exchange',
      'routingkey',
      {
        pattern,
        data: data,
      },
      { persistent: true },
    );
    console.log(`Sent message to exchange fanout_exchange:`, message);
  }

  async publishToTopic(pattern: string, routingKey: string, data: any) {
    try {
      const message = {
        pattern: pattern,
        data: data,
      };
      const retryCount = 0;
      await this.channel.publish(
        'topic_exchange',
        routingKey,
        { pattern, data },
        { persistent: true, headers: { 'x-retry-count': retryCount } },
      );
      console.log(
        `Sent message to topic_exchange with routing key ${routingKey}:`,
        message,
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  
}
