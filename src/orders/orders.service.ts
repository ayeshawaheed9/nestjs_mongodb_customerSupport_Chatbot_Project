import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { CreateOrderDto } from './create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject('ORDERS_SERVICE') private client: ClientProxy,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(orderData);
    const savedOrder = await newOrder.save();

    this.client.emit('order_created', savedOrder);
    
    return savedOrder;
  }
}
