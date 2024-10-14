import { Controller, Get,Post, Body, Param} from '@nestjs/common';
import { HuggingFaceServiceBertModel } from './hugging_face.service';
import { HuggingFaceServiceJsModel } from './huggingFaceJsModel.service'; 
import { HuggingFaceServiceGenerativeModel } from './huggingFaceGenerativeModel.service';
import { HfTransformerServiceModel } from './hfTransformerModel.service';
import { HuggingFaceService } from './hf.service';
import { Types } from 'mongoose';
import { redisClient } from 'src/main';
import { ChatHistoryService } from 'src/chatHistoryModule/chatHistory.service';

@Controller('huggingface')
export class HuggingFaceController {
  constructor(private readonly huggingFaceService: HuggingFaceService,
    private chatservice: ChatHistoryService
  ) {}
// this route is for other types of services, .ts service files

  // @Post('answer')
  // async getAnswer(@Body('question') question: string): Promise<string> {
  //   // Validate that a question has been provided
  //   if (!question) {
  //     throw new Error('Question is required');
  //   }

  //   try {
  //     const answer = await this.huggingFaceService.answerQuestion(question);
  //     //const answer = await this.huggingFaceService.generateText(question);
  //     return answer; // Return the answer from the service
  //   } catch (error) {
  //     throw new Error('Error retrieving answer: ' + error.message);
  //   }
  // }

  // for js version of service file // works perfectly 
  @Get('ask')
  async askQuestiongemma(@Body('question') question: string, @Body('userId')userId: string) {
    console.log(userId);
    return await this.huggingFaceService.getAnswer(question, userId);
  }

  @Post('/ask')
    async askQuestionFlan(@Body('userId') userId: string, @Body('question') question: string) {
        //const objId = new Types.ObjectId(userId);
        console.log(userId,'userid in controller')
        const answer = await this.huggingFaceService.getAnswer(userId, question);
        return answer ;
    }
  @Get('/chatHistory')
    async getChatHistory(@Body('userId') userId: string) {
      const convertedId =  new Types.ObjectId(userId);
      const chatKey = `chat_history:${convertedId}`; 
      try {
        // Retrieve all chat entries from Redis
        const chatHistory = await redisClient.lRange(chatKey, 0, -1); // Get all entries
        const parsedChatHistory = chatHistory.map(chat => JSON.parse(chat));
        // Sort the chat history by timestamp (oldest first)
        parsedChatHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return parsedChatHistory;
  
      } catch (error) {
        console.error("Error retrieving chat history from Redis:", error);
        throw error;
      }
    }

    @Get('chatHistory/:userId')
    async getChatHistoryfromdb(@Param('userId') userId: string) {
    // Fetch chat history from cache or database
    const chatHistory = await this.chatservice.getChatHistoryfromdb(userId);
    return chatHistory;
  }
}
