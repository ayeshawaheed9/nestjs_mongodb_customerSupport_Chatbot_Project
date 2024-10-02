import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/orders.schema';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { createRmqConnection } from 'src/rmq.config';
import { UserDocument } from 'src/schemas/user.schema';
import { Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
@Injectable()
export class OrdersService {
  public channel;
  constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @InjectModel(User.name) public UserModel: Model<UserDocument>,
    @Inject('ORDERS_SERVICE') public client: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    createRmqConnection().then((channel) =>{
      this.channel =channel;
    });
    console.log(cacheManager);
  }
  
  async checkRedisConnection(){
    await this.cacheManager.set('world','hello');
    const val = await this.cacheManager.get<string>('hello');
    console.log(val);
  }
  async createOrder_Direct(userId:string, orderData: CreateOrderDto) {
    const objectId = new Types.ObjectId(userId);

    // Find the user by ObjectId
    const user = await this.UserModel.findById(objectId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newOrder = new this.orderModel({
      ...orderData,
      user: user._id,  // Add the user's ObjectId to the order
    });

    const savedOrder = await newOrder.save();
    const routingKey = 'order_placed';
    
    const publishResult = this.channel.publish('direct_exchange',routingKey, savedOrder); 
    if (publishResult) {
      console.log('Order emitted to direct exchange');
    }
    console.log('Data Published');
    console.log('ID of saved order', savedOrder._id);

    user.orders.push(new Types.ObjectId(savedOrder._id));
    await user.save();

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
  async getAllOrders(page: number, limit: number) {
    // Check if orders are cached
    const skip = (page - 1) * limit; // Calculate the number of records to skip
    const cachedOrders = await this.cacheManager.get<OrderDocument[]>('all-orders');

    if (cachedOrders) {
      console.log('Cache hit: ', cachedOrders);
      return cachedOrders; // Return cached orders if found
    }

    // If not cached, fetch from the database
    const orders = await this.orderModel
    .find()
    .skip(skip)
    .limit(limit)
    .exec();

    // Cache the fetched orders
    await this.cacheManager.set('all-orders', orders); 
   const totalOrders = await this.orderModel.countDocuments(); // Get the total number of documents

    return {
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit), // Calculate total pages
      currentPage: page,
      orders, // Return the orders for the current page
    };
  }
}
