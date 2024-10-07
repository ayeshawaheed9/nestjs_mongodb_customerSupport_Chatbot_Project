import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';  // Adjust the path as needed
import { Order, OrderDocument } from 'src/schemas/orders.schema';  // Adjust the path as needed

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async search(query: string): Promise<{ users: User[]; orders: Order[] }> {
    const userSearch = this.userModel.find({
      userName: { $regex: query, $options: 'i' },
    });

    const orderSearch = this.orderModel.find({
      productName: { $regex: query, $options: 'i' },
    });

    const [users, orders] = await Promise.all([userSearch, orderSearch]);

    return { users, orders };
  }
}
