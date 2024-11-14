import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Discount {
  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: true, min: 0, default: 0 }) // percentage
  percentage: number;
}

@Schema()
export class Product {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ type: Discount })
  discount?: Discount; // Optional field for discounts
}

export const ProductSchema = SchemaFactory.createForClass(Product);
