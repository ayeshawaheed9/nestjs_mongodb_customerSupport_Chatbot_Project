import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { VersioningType } from '@nestjs/common';
dotenv.config();
console.log("ACCESS_TOKEN in main.ts:", process.env.ACCESS_TOKEN);
require("module-alias/register");
import { BarChartCmdService } from './Visualization/barChartCmd.service';

const redisClient = createClient({ url: 'redis://localhost:6379' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'orders_status_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  //app.useGlobalInterceptors( new RemoveIdInterceptor());

  await redisClient.connect();

  // Create the Redis store
  const redisStore = new RedisStore({ client: redisClient });
  // Use the Redis store in express-session
  app.use(
    session({
      store: redisStore,
      secret: 'super-secret-key',  // Use a strong secret in production
      resave: false,               // Don't save session if unmodified
      saveUninitialized: false,    // Don't create session until something stored
      cookie: {
        maxAge: 600000,
      },
    }),
  );
  await app.startAllMicroservices();
  console.log('Microservice listening for order status')
   app.enableVersioning({
    type: VersioningType.URI, // Type of versioning
    defaultVersion: '1',      // Optional default version
  });

  // // command line visualization of the data 
  // const chartService = app.get(ChartService); // Get ChartService instance
  // chartService.generateChart(); 
  
  
  await app.listen(9000);
}
export { redisClient };
bootstrap();