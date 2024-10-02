import { Injectable } from "@nestjs/common";
import { Order, OrderDocument } from '../schemas/orders.schema';
import { UserDocument, User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { Model } from "mongoose";
import { createUserDto } from "src/dtos/create-user.dto";
import { Cache } from 'cache-manager';

@Injectable()
export class UserService{
    constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @InjectModel(User.name) public userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

    ){}
    async createUser(user:createUserDto){
        const newUser = new this.userModel(user);
        const savedUser =  await newUser.save();

        await this.cacheManager.set(`user-${savedUser.userName}`, savedUser,3000);

        const leanUser= savedUser.toObject();
        return leanUser;
    }

    async getUserByName (userName: string){
        // Check if the order is cached
        const cachedUser = await this.cacheManager.get<UserDocument>(`user-${userName}`);
        
        if (cachedUser) {
          console.log('Cache hit:', cachedUser);
          return cachedUser; // Return from cache if exists
        }
        const user = await this.userModel.find({userName}).populate('orders').lean().exec();
    
        if (user) {
          await this.cacheManager.set(`order-${userName}`, user, 3600); 
        }
    
        return user;
      }
}