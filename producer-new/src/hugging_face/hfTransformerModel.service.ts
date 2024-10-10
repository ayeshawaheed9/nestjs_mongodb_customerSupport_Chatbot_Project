import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
// not working
@Injectable()
export class HfTransformerServiceModel {
  private answerer: any;
  private readonly contextFilePath = 'src/hugging_face/productContext.json'; 

  constructor() {
    this.initGenerator();
  }

  private async initGenerator() {
    const TransformersApi = Function('return import("@xenova/transformers")')();
    const { pipeline } = await TransformersApi;
    this.answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
  }

  private async readContextFromFile(): Promise<string> {
    try {
      const data = await fs.readFile(this.contextFilePath, 'utf-8');
      const jsonData = JSON.parse(data);
      const context = jsonData.products.map(product => {
        return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
      }).join('\n\n'); 
      return context;
    } catch (error) {
      throw new Error('Error reading or parsing context file: ' + error.message);
    }
  }

  async generateText(question: string):Promise<any>{
   const context = await this.readContextFromFile(); 

    try {
      const output = await this.answerer(question,context); // Provide the required input format (object with question and context)
      console.log(question,'\n',context)
      console.log(output);
      return output; // Return the generated answer
    } catch (error) {
      throw new Error('Error generating text: ' + error.message);
    }
 }
}
