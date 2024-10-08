import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import * as fs from 'fs';

@Injectable()
export class HuggingFaceServiceBertModel {
  private inference: HfInference;
  private readonly model: string = 'distilbert/distilbert-base-uncased-distilled-squad'; 
  private readonly accessToken: string = 'ACCESS_TOKEN';

  constructor() {
    this.inference = new HfInference(this.accessToken);
  }
  private readContextFromFile(): string {
    const filePath = 'src/hugging_face/productContext.json'; // Update with the correct path
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);
    const products = jsonContent.products;

    // Combine product details into a single context string
    const context = products.map(product => {
        return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
      }).join('\n\n'); // Join products with two new lines for better separation
  
      return context;
}

async answerQuestion(question: string): Promise<string> {
    const context = this.readContextFromFile(); // Get context from the file
    console.log('Context:', context);
    try {
      const result = await this.inference.questionAnswering({
        inputs: {
          question: question,
          context: context
        },
        model: 'distilbert-base-uncased-distilled-squad', // Specify the model
      });

      return result.answer; // Return the answer from the result
    } catch (error) {
      throw new Error('Error fetching answer from Hugging Face API: ' + error.message);
    }
  }
}
