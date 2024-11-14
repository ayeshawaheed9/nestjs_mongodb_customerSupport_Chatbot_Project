import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  _id: string;

  @Prop({ required: true })
  userId: Types.ObjectId; // Reference to the user who sent the message

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  response: string;

  @Prop({ default: Date.now }) // Default to current date and time
  timestamp: Date;

  __v: number; // Version key, added automatically by Mongoose
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
