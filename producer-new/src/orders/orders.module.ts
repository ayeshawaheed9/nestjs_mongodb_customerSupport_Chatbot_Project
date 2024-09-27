import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './orders.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
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
  )],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
