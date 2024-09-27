import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { ordersGateway } from './gateway/ordersGateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ordersGateway],
})
export class AppModule { }
