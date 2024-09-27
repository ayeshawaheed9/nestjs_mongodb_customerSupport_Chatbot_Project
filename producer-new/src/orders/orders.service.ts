import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { CreateOrderDto } from './create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { createRmqConnection } from 'src/rmq.config';
@Injectable()
export class OrdersService {
  public channel;
  constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @Inject('ORDERS_SERVICE') public client: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    createRmqConnection().then((channel) =>{
      this.channel =channel;
    });
    console.log(cacheManager);
  }
  
  async checkRedisConnection(){
    await this.cacheManager.set('hello','world');
    const val = await this.cacheManager.get<string>('hello');
    console.log(val);
  }
  async createOrder_Direct(orderData: CreateOrderDto): Promise<OrderDocument> {
    const newOrder = new this.orderModel(orderData);
  const savedOrder = await newOrder.save();
  const routingKey = 'order_placed';
  const publishResult = this.channel.publish('direct_exchange',routingKey, savedOrder); 
  if (publishResult) {
    console.log('Order emitted to direct exchange');
  }
  console.log('Data Published');
  console.log('ID of saved order', savedOrder._id);
  
  //write through cache
  await this.cacheManager.set(`order-${savedOrder._id}`, savedOrder,3000);
  //write behind cache 
  // Simulate async write to DB after delay
  // setTimeout(async () => {
  //   await newOrder.save(); // This writes to the database asynchronously
  // }, 5000);


  const leanOrder = savedOrder.toObject(); // Converts the Mongoose document to a plain object

  return leanOrder;
  }
  async getOrderById(orderId: string): Promise<OrderDocument> {
    // Check if the order is cached
    const cachedOrder = await this.cacheManager.get<OrderDocument>(`order-${orderId}`);
    
    if (cachedOrder) {
      console.log('Cache hit:', cachedOrder);
      return cachedOrder; // Return from cache if exists
    }
    const order = await this.orderModel.findById(orderId).lean().exec();

    if (order) {
      await this.cacheManager.set(`order-${orderId}`, order, 3600); 
    }

    return order;
  }

  async updateOrder(orderId: string, updateData: Partial<CreateOrderDto>): Promise<OrderDocument> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
    }).lean().exec();
  
    // Clear cache after updating the order
    await this.cacheManager.del(`order-${orderId}`);
  
    return updatedOrder;
  }
  async getAllOrders(): Promise<OrderDocument[]> {
    // Check if orders are cached
    const cachedOrders = await this.cacheManager.get<OrderDocument[]>('all-orders');

    if (cachedOrders) {
      console.log('Cache hit: ', cachedOrders);
      return cachedOrders; // Return cached orders if found
    }

    // If not cached, fetch from the database
    const orders = await this.orderModel.find().lean().exec();

    // Cache the fetched orders
    await this.cacheManager.set('all-orders', orders); 
    return orders;
  }
}