import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './schemas/orders.schema';
import { Order } from './schemas/orders.schema';
import { HuggingFaceGateway } from './gateway/huggingFace/huggingFace.gateway';
@Module({
  imports: [ 
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    DatabaseModule,ClientsModule.register([
    {
      name: 'ORDERS_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'orders_status_queue',
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
  controllers: [AppController],
  providers: [AppService, HuggingFaceGateway],
})
export class AppModule { }
