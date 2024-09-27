import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-ttl': 5000,
          'x-dead-letter-exchange': 'dlx_exchange',  // Configure Dead Letter Exchange
          'x-dead-letter-routing-key': 'dead_letter'  // Routing key for DLX
        }
      },
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'dlx_queue', // Dead-letter queue
      noAck: false, // Enable manual acknowledgment
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  console.log('Microservice is listening for orders...');
  app.listen(7000);
}

bootstrap();
