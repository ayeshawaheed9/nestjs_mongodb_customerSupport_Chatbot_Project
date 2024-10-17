
// // uisng google gemma model 
import { Injectable, Inject } from '@nestjs/common';
import { HfInference } from "@huggingface/inference";
import * as fs from 'fs/promises';
import { redisClient } from 'src/main';
import { ChatHistoryService } from 'src/chatHistoryModule/chatHistory.service';
import { encode } from 'gpt-3-encoder'; // Use a tokenizer
import { config } from 'dotenv';

config(); // Load .env variables

@Injectable()
export class HuggingFaceService {

    constructor(@Inject(ChatHistoryService) chatHistoryService) {
        const token = process.env.ACCESS_TOKEN; 
        console.log("Token value:", token); 
        
        this.chatService = chatHistoryService;
        this.inference = new HfInference(token);

        this.tokenLimit = parseInt(process.env.QUESTION_LENGTH, 10);
        console.log(this.tokenLimit);
    }
    async getAnswer(question, userId) {
        // Tokenize the question and check its length
        const tokenizedQuestion = encode(question);
        
        if (tokenizedQuestion.length > 50) {
            return 'Query exceeds the maximum token limit of 50.';
        }
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
    async getContextualAnswer(question, userId) {
        const tokenizedQuestion = encode(question);
        
        if (tokenizedQuestion.length > this.tokenLimit) {
            return 'Query exceeds the maximum token limit of 50.';
        }
        const context = await this.getUserContext();
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
    async getSentimentalAndContextualAnswer(question, userId) {
        const tokenizedQuestion = encode(question);
        
        if (tokenizedQuestion.length > this.tokenLimit) {
            return 'Query exceeds the maximum token limit of 50.';
        }
        const sentiment = await this.analyzeSentiment(question);
        let sentimentInstruction = '';
    
        if (sentiment === 'anger') {
            sentimentInstruction = 'Answer in a calming and soothing tone:';
        } else if (sentiment === 'joy') {
            sentimentInstruction = 'Respond with an excited and cheerful tone:';
        } else if (sentiment === 'sadness') {
            sentimentInstruction = 'Answer in a compassionate and comforting tone:';
        } else if (sentiment === 'fear') {
            sentimentInstruction = 'Respond in a reassuring manner:';
        } else if (sentiment === 'surprise') {
            sentimentInstruction = 'Respond with an engaging tone:';
        } else if (sentiment === 'disgust') {
            sentimentInstruction = 'Respond in a neutral and objective tone:';
        } else {
            sentimentInstruction = 'Provide a neutral response:';
        }
    
        
        const context = await this.getUserContext();
    
        const modifiedQuestion = `Context: ${context}\n${sentimentInstruction} ${question}`;
        const messages = [{ role: "user", content: modifiedQuestion }];
    
        const cacheKey = `answer_cache:${userId}:${question}`;
        let cachedResponse = await redisClient.get(cacheKey);
        if (cachedResponse) {
            console.log('Returning cached response.');
            return cachedResponse;
        }
    
        let responseText = '';
        try {
            for await (const chunk of this.inference.chatCompletionStream({
                model: "google/gemma-2-2b-it",  // Use your chosen model
                messages,
                max_tokens: 700,
            })) {
                responseText += chunk.choices[0]?.delta?.content || '';
            }
        } catch (error) {
            console.error('Error generating answer:', error);
            throw error;
        }
    
        await redisClient.set(cacheKey, responseText, 'EX', 3600); // Cache for 1 hour
    
        await this.chatService.appendtoChatDb(userId, question, responseText);
    
        return responseText;
    }
    
    async getUserContext(userId) {
    let cachedContext = await redisClient.get('contextCache');
    let dynamicContext = await this.chatService.getRecentUserQueries(userId);
    let context;

    if (!cachedContext) {
        context = await this.readContextFromFile();
    } else {
        context = cachedContext;
    }

    // Append dynamic context from the user's recent interactions
    context += `\nRecent Questions: ${dynamicContext.join('\n')}`;

    return context;
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

  async analyzeSentiment(question) {
    try {
        const sentimentResponse = await this.inference.textClassification({
            model: "j-hartmann/emotion-english-distilroberta-base",  // Sentiment analysis model
            inputs: question,
        });
        
        const sentimentLabel = sentimentResponse[0].label;  // The sentiment (POSITIVE, NEGATIVE, NEUTRAL)
        console.log(`Detected sentiment: ${sentimentLabel}`);
        return sentimentLabel;
    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        throw error;
    }
}
async detectIntent(question) {
    console.log("coming inside detectIntent")
    const intents = ["order_placing", "product_inquiry", "feedback", "complaint"];
    // Perform zero-shot classification to detect the intent
    const result = await this.inference.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: question,
        parameters: {
            candidate_labels: intents,
        }
    });
    console.log("checking ocming result", result)
   // Get the scores and labels from the result
   const scores = result[0].scores;
   const labels = result[0].labels;

   // Find the index of the highest score
   const highestScoreIndex = scores.indexOf(Math.max(...scores));

   // Get the label corresponding to the highest score
   const mostLikelyIntent = labels[highestScoreIndex];

   console.log("Most likely intent:", mostLikelyIntent);

   // Return the most likely intent
   return mostLikelyIntent;


   // return result.labels[0];  // Return the most likely intent
}
async getSentimentalIntentContextualAnswer(question, userId) {
    const tokenizedQuestion = encode(question);
        
    if (tokenizedQuestion.length > this.tokenLimit) {
            return 'Query exceeds the maximum token limit of 50.';
    }
    // Get context for the user from past interactions
    const context = await this.getUserContext(userId);
    console.log('Context:', context);
    
    // Get the sentiment of the question
    const sentiment = await this.analyzeSentiment(question);
    
    console.log('Sentiment:', sentiment);
    // Detect the intent behind the question
    const intent = await this.detectIntent(question);
    
    console.log('Intent:', intent);
    
    // Add all factors to the final prompt
    const messages = [{ 
        role: "user", 
        content: `Context: ${context}\nSentiment: ${sentiment}\nIntent: ${intent}\nQuestion: ${question}` 
    }];
    
    const cacheKey = `answer_cache:${userId}:${question}`;
    let cachedResponse = await redisClient.get(cacheKey);
    if (cachedResponse) {
        console.log('Returning cached response.');
        return cachedResponse;
    }
    
    let responseText = '';
    // Get the response using the contextual and sentimental data
    for await (const chunk of this.inference.chatCompletionStream({
        model: this.qaModel,
        messages,
        max_tokens: 700,
    })) {
        responseText += chunk.choices[0]?.delta?.content || '';
    }
    
    // Cache and store in the chat history
    await redisClient.set(cacheKey, responseText, 'EX', 3600);
    await this.chatService.appendtoChatDb(userId, question, responseText);
    return responseText;
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
