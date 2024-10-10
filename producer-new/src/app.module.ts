  import { Module } from '@nestjs/common';
  import { AppService } from './app.service';
  import { APP_INTERCEPTOR } from '@nestjs/core';
  import { DatabaseModule } from './database/database.module';
  import { OrdersModule } from './orders/orders.module';
  import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
  import * as redisStore from 'cache-manager-ioredis';
  import { UserModule } from './users/users.module';
  import { fileUploadModule } from './fileUpload/fileUpload.module';
  import { AppController } from './app.controller';
  import { SearchModule } from './searchmodule/search.module';
  import { HuggingFaceServiceBertModel } from './hugging_face/hugging_face.service';
  import { HuggingFaceController } from './hugging_face/hugging_Face.controller';
  import { ConfigModule } from '@nestjs/config';
  import { CustomCacheInterceptor } from './interceptors/customCacheInterceptor';
  import { HuggingFaceServiceGenerativeModel } from './hugging_face/huggingFaceGenerativeModel.service';
  import { HuggingFaceServiceJsModel } from './hugging_face/huggingFaceJsModel.service';
  import { HfTransformerServiceModel } from './hugging_face/hfTransformerModel.service';
  import { HuggingFaceService } from './hugging_face/hf.service';
  @Module({
    imports: [ DatabaseModule, SearchModule, OrdersModule, UserModule , fileUploadModule,
      CacheModule.register({
        store: redisStore,
        host: 'localhost', 
        port: 6379,
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ],
    controllers: [AppController, HuggingFaceController],
    providers: [AppService,
      {
        provide: APP_INTERCEPTOR,
        useClass: CustomCacheInterceptor,
      },
      HuggingFaceServiceBertModel, HuggingFaceServiceJsModel, HuggingFaceServiceGenerativeModel, HfTransformerServiceModel,
      HuggingFaceService
    ],
  })
  export class AppModule {}
