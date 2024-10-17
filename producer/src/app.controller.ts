import { Controller, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Types } from "mongoose";
import { Order, OrderDocument } from "./schemas/orders.schema";
import { ClientProxy } from "@nestjs/microservices";
import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { createRmqConnection } from "./config/rmq.config";
@Controller()
export class AppController{
    public channel;
    constructor(
        @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
        @Inject('ORDERS_SERVICE') public client: ClientProxy,
    )
    {
        createRmqConnection().then((channel) =>{
            this.channel =channel;
          });
    }

    @MessagePattern()
    async acceptOrder(@Payload() orderId: string , @Ctx() context: RmqContext) {
    console.log('Order Received with orderID: ',orderId );
    console.log('type of id: ',typeof orderId);
    const mongooseOrderId = new Types.ObjectId(orderId);

    // Log the order ID being used
    console.log(`Searching for Order with ID: ${mongooseOrderId}`);

    // Query by orderId
    const receivedOrder = await this.orderModel.findById(mongooseOrderId);

    if (!receivedOrder) {
      console.error(`Order with ID ${mongooseOrderId} not found in the database.`);
      return;
    }

    // Update status to shipped
    receivedOrder.status = 'SHIPPED';
    await receivedOrder.save();

    // Publish the order status update back to RabbitMQ
    const message = `Order Status updated to ${receivedOrder.status}, order Id: ${mongooseOrderId}`;
    await this.channel.publish('order_status_exchange', 'order_status_updated', message);
    console.log('Order status published:', message);
    
    // Explicitly acknowledge the message
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    }
    // @MessagePattern('dead_letter')
    // async acceptOrder(@Payload() order : any, @Ctx() context: RmqContext){
    //     const channel = context.getChannelRef(); 
    //     const originalMessage = context.getMessage(); // Get the original RabbitMQ message
    //     console.log('Order Recieved by dlq: ', order);

    // }
}