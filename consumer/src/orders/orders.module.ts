import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../schemas/orders.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthGuard } from 'src/guard/auth.guard';
import { UserService } from 'src/users/users.service';
// Import the JavaScript file as a CommonJS module
import ChartService from 'src/Visualization/imageChart.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'orders_queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',  // Configure Dead Letter Exchange
              'x-dead-letter-routing-key': 'dead_letter'  // Routing key for DLX
            }
          },
        },
      },
    ]),
  CacheModule.register(
    {
        store: redisStore,
        host: 'localhost', 
        port: 6379,
    }
  ), ChartService],
  controllers: [OrdersController],
  providers: [OrdersService, AuthGuard, UserService, ChartService],
})
export class OrdersModule {}
