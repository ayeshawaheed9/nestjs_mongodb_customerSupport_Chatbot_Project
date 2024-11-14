import { Controller, Inject, Body, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/orders.schema';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    // @Inject('ORDERS_SERVICE') public client: ClientProxy,
    private readonly appservice: AppService,
  ) {}

  @Post('publish')
  async publishMessage() {
    try {
      const message1 = 'message for consumer1';
      const message2 = 'message for consumer2';
      const message3 = 'message for consumer3';

      await this.appservice.publishMessage('consumer1', message1);
      await this.appservice.publishMessage('consumer2', message2);
      await this.appservice.publishMessage('consumer3', message3);

      return { status: 'Message published successfully' };
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  @Post('/publishEvent')
  async publishEvent() {
    this.appservice.publishEvent('eventType1', 'Event 1 Data');

    this.appservice.publishEvent('eventType2', 'Event 2 Data');

    this.appservice.publishEvent('eventType3', 'Event 3 Data');
  }

  @Post('/publishTopicEvent')
  async publishEventToTopic() {
    await this.appservice.publishToTopic('eventType1', 'orders.key', {
      orderId: 123,
      details: 'Order details',
    });
    await this.appservice.publishToTopic('eventType2', 'billing.key', {
      billingId: 456,
      amount: 100,
    });
    await this.appservice.publishToTopic('eventType3', 'notifications.key', {
      message: 'New notification',
    });
  }
  @Post('send-retry-message')
  async sendRetryMessage() {
    await this.appservice.publishToTopic('eventType2', 'billing.key', null);
    return 'Message sent for retry testing';
  }
}

// @MessagePattern()
// async acceptOrder(@Payload() orderId: string , @Ctx() context: RmqContext) {
// console.log('Order Received with orderID: ',orderId );
// console.log('type of id: ',typeof orderId);
// const mongooseOrderId = new Types.ObjectId(orderId);

// // Log the order ID being used
// console.log(`Searching for Order with ID: ${mongooseOrderId}`);

// // Query by orderId
// const receivedOrder = await this.orderModel.findById(mongooseOrderId);

// if (!receivedOrder) {
//   console.error(`Order with ID ${mongooseOrderId} not found in the database.`);
//   return;
// }

// // Update status to shipped
// receivedOrder.status = 'SHIPPED';
// await receivedOrder.save();

// // Publish the order status update back to RabbitMQ
// const message = `Order Status updated to ${receivedOrder.status}, order Id: ${mongooseOrderId}`;
// await this.channel.publish('order_status_exchange', 'order_status_updated', message);
// console.log('Order status published:', message);

// // Explicitly acknowledge the message
// const channel = context.getChannelRef();
// const originalMessage = context.getMessage();
// channel.ack(originalMessage);
// }
// // @MessagePattern('dead_letter')
// // async acceptOrder(@Payload() order : any, @Ctx() context: RmqContext){
// //     const channel = context.getChannelRef();
// //     const originalMessage = context.getMessage(); // Get the original RabbitMQ message
// //     console.log('Order Recieved by dlq: ', order);

// // }
