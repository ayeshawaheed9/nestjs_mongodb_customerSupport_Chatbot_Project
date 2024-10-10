import { Controller, Get,Post, Body } from '@nestjs/common';
import { HuggingFaceServiceBertModel } from './hugging_face.service';
import { HuggingFaceServiceJsModel } from './huggingFaceJsModel.service'; 
import { HuggingFaceServiceGenerativeModel } from './huggingFaceGenerativeModel.service';
import { HfTransformerServiceModel } from './hfTransformerModel.service';
import { HuggingFaceService } from './hf.service';

@Controller('huggingface')
export class HuggingFaceController {
  constructor(private readonly huggingFaceService: HuggingFaceService
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
  async askQuestion(@Body('question') question: string) {
    return await this.huggingFaceService.getAnswer(question);
  }
}
