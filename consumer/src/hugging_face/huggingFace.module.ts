
import { Module } from '@nestjs/common';
import { HuggingFaceService } from './hf.service'; 
import { ChatHistoryService } from '../chatHistoryModule/chatHistory.service'; 
import { chatHistoryModule } from 'src/chatHistoryModule/chatHistory.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { forwardRef } from '@nestjs/common';
import { HuggingFaceController } from './hugging_Face.controller';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
    imports:[
      MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), // Ensure the model is registered
        chatHistoryModule, ThrottlerModule],
  providers: [HuggingFaceService],
  controllers:[HuggingFaceController]
})
export class HuggingFaceModule {}
