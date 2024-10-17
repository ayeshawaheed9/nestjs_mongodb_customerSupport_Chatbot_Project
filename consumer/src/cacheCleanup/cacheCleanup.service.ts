import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import { redisClient } from 'src/main';

@Injectable()
export class ContextRefreshService {
    @Cron('0 0 * * * *') // Run at the start of every hour
    async refreshContext() {
    try {
      const contextFilePath = 'src/hugging_face/productContext.json'; 
      const data = await fs.readFile(contextFilePath, 'utf-8');
      const context = JSON.parse(data).products.map(product => {
        return `Product Name: ${product.name}\nDescription: ${product.description}\nBenefits: ${product.benefits}`;
      }).join('\n\n');
      await redisClient.set('contextCache', context, {
        EX: 3600, // Expire in 3600 seconds (1 hour)
});        
    console.log('Context refreshed and cached in Redis.');
    } catch (error) {
      console.error('Error refreshing context:', error);
    }
  }
}
