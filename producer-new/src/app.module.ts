import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { UserModule } from './users/users.module';
import { fileUploadModule } from './fileUpload/fileUpload.module';

@Module({
  imports: [ DatabaseModule, OrdersModule, UserModule , fileUploadModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost', 
      port: 6379,
  }),
  ],
  controllers: [],
  providers: [AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    }
  ],
})
export class AppModule {}
