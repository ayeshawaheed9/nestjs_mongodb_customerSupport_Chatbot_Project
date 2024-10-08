import { Controller, Get, Body } from '@nestjs/common';
import { HuggingFaceServiceBertModel } from './hugging_face.service';
import { HuggingFaceServiceJsModel } from './huggingFaceJsModel.service'; 
@Controller('huggingface')
export class HuggingFaceController {
  constructor(private readonly huggingFaceService: HuggingFaceServiceJsModel
  ) {}

  @Get('answer')
  async getAnswer(@Body('question') question: string): Promise<string> {
    // Validate that a question has been provided
    if (!question) {
      throw new Error('Question is required');
    }

    try {
      const answer = await this.huggingFaceService.answerQuestion(question);
      return answer; // Return the answer from the service
    } catch (error) {
      throw new Error('Error retrieving answer: ' + error.message);
    }
  }
}
