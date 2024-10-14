
import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chatHistory.service'; 
import { ChatSchema, Chat } from 'src/schemas/chat.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), // Ensure the model is registered
    CacheModule.register(
        {
            store: redisStore,
            host: 'localhost', 
            port: 6379,
        }
      )    ],
  providers: [ChatHistoryService],
  exports:[ChatHistoryService]
})
export class chatHistoryModule {}
