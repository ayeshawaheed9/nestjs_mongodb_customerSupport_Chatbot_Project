import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { RolesGuard } from 'src/guard/role.guard';
import { UserService } from '@users/users.service';
import { Order, OrderSchema } from '@schemas/orders.schema';
import { User, UserSchema } from '@schemas/user.schema';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from "cache-manager-ioredis";
import { OrdersService } from '@orders/orders.service';
import { forwardRef } from '@nestjs/common';
import { OrdersModule } from '@orders/orders.module';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
CacheModule.register(
        {
            store: redisStore,
            host: 'localhost', 
            port: 6379,
        }
      ),
    forwardRef(() => OrdersModule,),
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
    ]),],
  providers: [ProductService, RolesGuard, UserService, OrdersService],
  controllers: [ProductController],
})
export class ProductModule {}
