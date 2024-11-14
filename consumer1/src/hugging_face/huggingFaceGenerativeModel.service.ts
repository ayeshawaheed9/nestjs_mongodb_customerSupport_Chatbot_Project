import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
// this model does not take context and gives general output based on the question but gives good answers 
@Injectable()
export class HuggingFaceServiceGenerativeModel {
  private readonly accessToken: string = 'ACCESS_TOKEN'; 
  private async readContextFromFile(): Promise<string> {
    const filePath = 'src/hugging_face/productContext.json'; 
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }
        try {
          const jsonData = JSON.parse(data);
          const context = jsonData.products.map(product => {
            return `Product Name: ${product.name}. Description: ${product.description}. Benefits: ${product.benefits}.`;
          }).join(' '); 
          resolve(context);
        } catch (parseError) {
          reject(new Error('Invalid JSON format: ' + parseError.message));
        }
      });
    });
  }

  async query(data: { inputs: string }): Promise<any> {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/gemma-2-2b-it",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
     
      const result = await response.json();
      const generatedText = result[0].generated_text;

      const cleanedText = generatedText
        .replace(/question:.*?\n/, '')  
        .replace(/\n+/g, '\n') 
        .replace(/\*\*/g, '');

      console.log(result)
      return cleanedText;
    
    
    } catch (error) {
      throw new Error('Error fetching answer from Hugging Face API: ' + error.message);
    }
  }

  async answerQuestion(question: string): Promise<any> {
    const context = await this.readContextFromFile(); // Read context from the JSON file
    const data = { inputs: `question: ${question}` }; // Format the input
    const response = await this.query(data);
    return response
  }
}
