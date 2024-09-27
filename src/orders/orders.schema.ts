import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop()
  productName: string;

  @Prop()
  quantity: number;

  @Prop()
  customerName: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
