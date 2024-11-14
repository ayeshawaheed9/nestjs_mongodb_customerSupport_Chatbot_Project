import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true }) 
  userName: string;

  @Prop({ 
    type: [{ 
      product: { type: Types.ObjectId, ref: 'Product' },
      productName: { type: String, required: true }, 
      quantity: { type: Number, required: true },
      totalPrice: { type: Number }
    }]
  })
  products: {
    product: Types.ObjectId;
    productName: string;
    quantity: number;
    totalPrice: number;
  }[];

  @Prop({ default: false })
  isCheckedOut: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
