
// // uisng google gemma model 
import { Injectable, Inject } from '@nestjs/common';
import { HfInference } from "@huggingface/inference";
import * as fs from 'fs/promises';
import { redisClient } from 'src/main';
import { ChatHistoryService } from 'src/chatHistoryModule/chatHistory.service';

@Injectable()
export class HuggingFaceService {
    constructor(@Inject(ChatHistoryService) chatHistoryService) {
        this.chatService = chatHistoryService;
        this.inference = new HfInference("ACCESS_TOKEN");
    }
    async getAnswer(question, userId) {
        const context = await this.getContext();
        console.log('user id in function get answer', userId);
        
        const messages = [{ role: "user", content: `Context: ${context}\nQuestion: ${question}` }];
        const cacheKey = `answer_cache:${userId}:${question}`;
    
        let cachedResponse = await redisClient.get(cacheKey);
        if (cachedResponse) {
            console.log('Returning cached response.');
            return cachedResponse;
        }
    
        let responseText = '';
        // If not in cache, use chatCompletionStream to get a streamed response
        for await (const chunk of this.inference.chatCompletionStream({
            model: "google/gemma-2-2b-it",
            messages,
            max_tokens: 700,
        })) {
            responseText += chunk.choices[0]?.delta?.content || '';
        }
    
        // Cache the response in Redis for future queries (set it to expire in 1 hour)
        await redisClient.set(cacheKey, responseText, 'EX', 3600);
    
        // Append the question and response to the chat history in MongoDB
        await this.chatService.appendtoChatDb(userId, question, responseText);
    
        return responseText;
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

//USING GOOGLE-FLAN T5 MODEL 

// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs/promises';
// import { redisClient } from 'src/main';
// import { ChatHistoryService } from 'src/chatHistoryModule/chatHistory.service';
// import { Inject } from '@nestjs/common';
// @Injectable()
// export class HuggingFaceService {
//     constructor(@Inject(ChatHistoryService) chatHistoryService) {
//         this.apiUrl = "https://api-inference.huggingface.co/models/google/flan-t5-large";
//         this.apiKey = "ACCESS_TOKEN"; 
//         this.chatHistoryService = chatHistoryService;  // Injected service
//     }

//     async getAnswer(userId,question) {
//         const context = await this.getContext();
//         const data = {
//             inputs: `Context: ${context}\nQuestion: ${question}`
//         };

//         const response = await this.query(data);
//         console.log(userId, 'from getAnswer function')
//         const convertedResponse = response.map(item => item.generated_text).join(' ');
//         await this.chatHistoryService.appendtoChatDb(userId, question, convertedResponse);
//         return response;
//     }

//     async getContext() {
//         let cachedContext = await redisClient.get('contextCache');
//         let context; 

//         if (!cachedContext) {
//             context = await this.readContextFromFile();
//             await redisClient.set('contextCache', context, { EX: 3600 }); // Cache for 1 hour
//         } else {
//             context = cachedContext; 
//         }

//         return context; 
//     }

//     async readContextFromFile() {
//         try {
//             const contextFilePath = 'src/hugging_face/productContext.json'; 
//             const data = await fs.readFile(contextFilePath, 'utf-8');
//             const jsonData = JSON.parse(data);
  
//             const context = jsonData.products.map(product => {
//                 return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
//             }).join('\n\n');
  
//             return context;
//         } catch (error) {
//             throw new Error('Error reading or parsing context file: ' + error.message);
//         }
//     }

//     async query(data) {
//         const response = await fetch(this.apiUrl, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${this.apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             throw new Error('Error fetching response from Hugging Face API: ' + response.statusText);
//         }

//         const result = await response.json();
//         return result;
//     }
// }
