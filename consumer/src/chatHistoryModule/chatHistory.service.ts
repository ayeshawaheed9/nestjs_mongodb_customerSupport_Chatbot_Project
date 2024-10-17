import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { redisClient } from 'src/main';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { Model } from 'mongoose';
@Injectable()
export class ChatHistoryService {
  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>) { }
  //
  // chat history using redis
  //
  //
  async appendtoChatCache(userId: Types.ObjectId, question: string, response: any) {
    const timestamp = new Date().toISOString(); // Get current timestamp

    const chatEntry = {
      userId,
      question,
      response,
      timestamp,
    };

    const chatKey = `chat_history:${userId}`;
    console.log(chatEntry);
    try {
      // Store the chat entry in Redis
      await redisClient.rPush(chatKey, JSON.stringify(chatEntry));
      await redisClient.expire(chatKey, 3600);
    } catch (error) {
      console.error("Error appending to chat in Redis:", error);
      throw error;
    }
  }
  //
  //CHAT HISTORY USING MONGODB
  // Function to fetch chat history (first from cache, then fallback to MongoDB)
  async getChatHistoryfromdb(userId: string) {
    const chatKey = `chat_history:${userId}`;

    // Try fetching from Redis cache first
    const cachedHistory = await redisClient.lRange(chatKey, 0, -1);
    if (cachedHistory && cachedHistory.length > 0) {
      const parsedHistory = cachedHistory.map(entry => JSON.parse(entry));
      console.log('Chat history fetched from Redis cache.');
      return parsedHistory;
    }

    // Fetch from MongoDB
    const objectId = new Types.ObjectId(userId);
    const dbHistory = await this.chatModel.find({ userId: objectId }).sort({ timestamp: 1 }).lean();  // Use the injected model

    // Cache the fetched data into Redis for future requests
    if (dbHistory.length > 0) {
      const stringifiedHistory = dbHistory.map(chat => JSON.stringify(chat));
      await redisClient.rPush(chatKey, stringifiedHistory);
      await redisClient.expire(chatKey, 3600);
      console.log('Chat history cached in Redis.');
    }
    return dbHistory;  // Return the chat history from MongoDB
  }

  // Function to append chat to MongoDB and cache
  async appendtoChatDb(inputId: string, question: string, response: any) {
    const objId = new Types.ObjectId(inputId);
    const timestamp = new Date();
    const userId = objId;
    console.log("data check", userId, question, response, timestamp)
    const chatEntry = new this.chatModel({
      userId,
      question,
      response,
      timestamp,
    });

    try {
      const savedChat = await chatEntry.save(); // Use the injected model
      const chatKey = `chat_history:${userId}`;
      const chatData = JSON.stringify(savedChat);
      await redisClient.rPush(chatKey, chatData);
      await redisClient.expire(chatKey, 3600);
      console.log("Chat successfully saved to MongoDB and cached in Redis:", savedChat);

      return savedChat;
    } catch (error) {
      console.error("Error saving chat to MongoDB or Redis:", error);
      throw error;
    }
  }

  async getRecentUserQueries(userId: string) {
    const recentQueries = await this.chatModel.find({ userId: new Types.ObjectId(userId) })
                                               .sort({ timestamp: -1 })
                                               .limit(5) 
                                               .lean()
                                               .exec();
    return recentQueries.map(query => query.question);
  }
}
