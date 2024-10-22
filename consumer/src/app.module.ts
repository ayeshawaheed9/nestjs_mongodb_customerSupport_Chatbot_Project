  import { Module , NestModule} from '@nestjs/common';
  import { AppService } from './app.service';
  import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { ChatHistoryService } from './chatHistoryModule/chatHistory.service';
import { HuggingFaceModule } from './hugging_face/huggingFace.module';
import { chatHistoryModule } from './chatHistoryModule/chatHistory.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema} from './schemas/chat.schema'; 
import { HuggingFaceGateway } from './gateway/huggingFace/huggingFace.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggingModule } from './loggingModule/logging.module';
import { MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './middlewares/logging.middleware';
@Module({
    imports: [ 
      MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), // Ensure the model is registered
      DatabaseModule, SearchModule, OrdersModule, UserModule , fileUploadModule,HuggingFaceModule,chatHistoryModule,LoggingModule,
      CacheModule.register({
        store: redisStore,
        host: 'localhost', 
        port: 6379,
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 3,
    }]),
    ],
    controllers: [AppController],
    providers: [AppService,
      {
        provide: APP_INTERCEPTOR,
        useClass: CustomCacheInterceptor,
      },
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard
      },
    HuggingFaceGateway, HuggingFaceService],
  })

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware) // Apply the LoggingMiddleware
      .forRoutes('*'); // Use '*' to apply it to all routes
  }
}
