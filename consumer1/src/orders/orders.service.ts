import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/orders.schema';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { NotFoundException , BadRequestException} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
// import { createRmqConnection } from 'src/rmq.config';
import { UserDocument } from 'src/schemas/user.schema';
import { Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import session from 'express-session';
import { Subject } from 'rxjs';
import { CartService } from 'src/cart/cart.service';
@Injectable()
export class OrdersService {
  public channel;
  private productRestockedSubject = new Subject<string>(); // Subject for product restock notifications
  constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @InjectModel(User.name) public UserModel: Model<UserDocument>,
    @InjectModel(Product.name) public productModel: Model<ProductDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
    public cartService:CartService
  ) {
    
    console.log(cacheManager);
    this.productRestockedSubject.subscribe((productName) => {
      // what to do when recieved the message form the observable, wo yahan hoga 
      console.log(`Notification: The product "${productName}" has been restocked!`);
    });
  }
  // Function to call when a product is restocked
  notifyRestockedProduct(productName: string) {
    this.productRestockedSubject.next(productName);
  }
  async checkRedisConnection(){
    await this.cacheManager.set('world','hello');
    const val = await this.cacheManager.get<string>('hello');
    console.log(val);
  }
 async createOrder_Direct(userId: string, orderData: CreateOrderDto, session: any) {
  const objectId = new Types.ObjectId(userId);

  // Find the user by ObjectId
  const user = await this.UserModel.findById(objectId).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }
  if (!user.isloggedIn) {
    throw new UnauthorizedException('Please login first.');
  }
  session.userId = user._id; 

  const product = await this.productModel.findOne({ name: orderData.productName }).exec();
  if (!product) {
    throw new BadRequestException('Product not found');
  }
  if (product.quantity === 0) {
    throw new NotFoundException('Product Sold out');
  }
  if (product.quantity < orderData.quantity) {
    throw new BadRequestException(`Insufficient stock for ${product.name}. Only ${product.quantity} items left.`);
  }

  console.log('Stock before order:', product.quantity);
  console.log('Quantity requested:', orderData.quantity);

  
  let finalPrice = product.price;
  if (product.discount && product.discount.isActive) {
    finalPrice = product.price - (product.price * product.discount.percentage) / 100;
  }
  const newOrder = new this.orderModel({
    ...orderData,
    user: user._id,
    productPrice: product.price,           
    discountedPrice: finalPrice,            
  });

  const savedOrder = await newOrder.save();

  // // Emit event to RabbitMQ
  // const routingKey = 'order_placed';
  // const publishResult = this.channel.publish('direct_exchange', routingKey, Buffer.from(savedOrder._id.toString()));
  // if (publishResult) {
  //   console.log('Order emitted to direct exchange');
  // }
  console.log('ID of saved order:', savedOrder._id);

  product.quantity -= orderData.quantity;
  await product.save();

  // Add the order to the user's order history
  user.orders.push(new Types.ObjectId(savedOrder._id));
  await user.save();

  // Write-through cache
  await this.cacheManager.set(`order-${savedOrder._id}`, savedOrder, 3000);
  return savedOrder.toObject();
}

  async getOrderById(orderId: string): Promise<any> {
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

  // async updateOrder(orderId: string, updateData: Partial<CreateOrderDto>):Promise<any> {
  //   const updatedOrder = await this.orderModel.findByIdAndUpdate(orderId, updateData, {
  //     new: true,
  //   }).lean().exec();
  
  //   // Clear cache after updating the order
  //   await this.cacheManager.del(`order-${orderId}`);
  
  //   return updatedOrder;
  // }
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
  
  async getAllOrdersWithoutPagination(): Promise<any> {
    // Check if orders are cached
    const cachedOrders = await this.cacheManager.get<OrderDocument[]>('all-orders-no-pagination');
    if (cachedOrders) {
      console.log('Cache hit for all orders:');
      return cachedOrders; // Return cached orders if found
    }

    // Fetch all orders without pagination if not cached
    const orders = await this.orderModel.find().lean().exec();

    // Cache the fetched orders
    await this.cacheManager.set('all-orders-no-pagination', orders, 3600 ); // Cache for 1 hour
    return orders;
  }


  /// for image graph 

  async getOrderSummary(): Promise<Record<string, number>> {
    // Use the new method to get all orders
    const orders: OrderDocument[] = await this.getAllOrdersWithoutPagination();

    const summary = orders.reduce((acc, order) => {
      const productName = order.productName; // Use productName for summarization
      if (productName) { // Check if productName is defined
        acc[productName] = (acc[productName] || 0) + order.quantity;
      }
      return acc;
    }, {});

    return summary; // { productName1: quantity1, productName2: quantity2, ... }
  }
}
