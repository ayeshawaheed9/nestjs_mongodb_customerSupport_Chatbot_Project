import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { Order } from './orders.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: string;
  
  @Prop({unique: true})
  userName: string;

  @Prop({required: true})
  password: string

  @Prop({required: true})
  phoneNumber: number;

  @Prop({default: false})
  isloggedIn: boolean

  @Prop({required:false})
  email: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })  // Reference to multiple orders
  orders:Types.ObjectId[];

  @Prop({type: String, enum: ['admin', 'customer'], required: true }) // Role property
  role: string; // Only one role allowed (either 'admin' or 'customer')

}

export const UserSchema = SchemaFactory.createForClass(User);
