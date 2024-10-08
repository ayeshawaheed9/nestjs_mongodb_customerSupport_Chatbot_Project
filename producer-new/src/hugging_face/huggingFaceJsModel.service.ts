import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HuggingFaceServiceJsModel {
  private inference: HfInference;
  //private readonly model: string = 'mistralai/Mistral-7B-v0.1'; // Replace with your desired model
  private readonly accessToken: string = 'ACCESS_TOKEN'; // Use your access token from .env file

  constructor() {
    this.inference = new HfInference(this.accessToken);
  }

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
            return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
          }).join('\n\n'); // Join products with two new lines for better separation
          resolve(context);
        } catch (parseError) {
          reject(new Error('Invalid JSON format: ' + parseError.message));
        }
      });
    });
  }

  async answerQuestion(question: string): Promise<any> {
    const context = await this.readContextFromFile(); // Get context from the JSON file
    console.log(context);
    const data = {
      inputs: {
        question: question,
        context: context,
      },
    };

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`, // Use the access token for authorization
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      console.log(JSON.stringify(response));
      const result = await response.json(); // Parse the response as JSON
      return result.answer; // Return the result
    } catch (error) {
      throw new Error('Error fetching answer from Hugging Face API: ' + error.message);
    }
  }
}
