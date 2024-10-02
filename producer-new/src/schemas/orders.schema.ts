import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  _id: string;
  
  @Prop()
  productName: string;

  @Prop()
  quantity: number;

  @Prop()
  customerName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })  // Reference to the user who placed the order
  user: User | Types.ObjectId;
  __v: number;

  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);