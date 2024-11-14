import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.startAllMicroservices();
  console.log('Producer Started...');
  app.listen(9001);
}

bootstrap();
