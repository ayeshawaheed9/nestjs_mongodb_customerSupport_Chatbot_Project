
import { Injectable, Inject } from '@nestjs/common';
import { HfInference } from "@huggingface/inference";
import * as fs from 'fs/promises';
import { redisClient } from 'src/main';
@Injectable()
export class HuggingFaceService {
    constructor() {
        this.inference = new HfInference("ACCESS_TOKEN");
        
    }
    async getAnswer(question) {
    const context = await this.getContext();
    const messages = [{ role: "user", content: `Context: ${context}\nQuestion: ${question}` }];
    let responseText = '';

    // Use chatCompletionStream to get a streamed response
    for await (const chunk of this.inference.chatCompletionStream({
      model: "google/gemma-2-2b-it",
      messages,
      max_tokens: 700,
    })) {
      responseText += chunk.choices[0]?.delta?.content || '';
    }

    return responseText; // Return the complete response
  }
  async getContext() {
    let cachedContext = await redisClient.get('contextCache');
    let context; 

    if (!cachedContext) {
        // If not cached, read from file and store in cache
        context = await this.readContextFromFile();
        await redisClient.set('contextCache', context, { EX: 3600 }); // Cache for 1 hour
    } else {
        context = cachedContext; 
    }

    return context; 
}
  async readContextFromFile() {
    try {
        const contextFilePath = 'src/hugging_face/productContext.json'; 
        const data = await fs.readFile(contextFilePath, 'utf-8');
        const jsonData = JSON.parse(data);
  
      const context = jsonData.products.map(product => {
        return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
      }).join('\n\n');
  
      return context;
    } catch (error) {
      throw new Error('Error reading or parsing context file: ' + error.message);
    }
  }
}
