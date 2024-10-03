import { Body, Injectable } from "@nestjs/common";
import { Order, OrderDocument } from '../schemas/orders.schema';
import { UserDocument, User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from '@nestjs/cache-manager'; 
import * as bcrypt from 'bcrypt';
import { Model } from "mongoose";
import { createUserDto } from "src/dtos/create-user.dto";
import { Cache } from 'cache-manager';
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { userloginDto } from "src/dtos/user-login.dto";
@Injectable()
export class UserService{
    constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @InjectModel(User.name) public userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

    ){}
    async createUser(user:createUserDto,){
        const saltOrRounds=10;
        user.password = await bcrypt.hash(user.password, saltOrRounds);
        
        const newUser = new this.userModel(user);
        const savedUser =  await newUser.save();
        await this.cacheManager.set(`user-${savedUser.userName}`, savedUser,3000);

        const leanUser= savedUser.toObject();

        if(leanUser){
          return {
            message: 'User created successfully'
          }
        }
    }
    async loginUser(credentials: userloginDto, session: any){
      const username = credentials.username
      const password = credentials.password

      const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid password');
    }
    session.userId = user._id; // Store user ID in session
    user.isloggedIn = true;
    await user.save();
    console.log(session.userId);
    return {
      message: 'login successfull'
    }
    }

    async getUserById(userId: string){
      const user = await this.userModel.findById(userId)
      if(!user){
        throw new NotFoundException('User not found')
      }
      return user;
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
      async logout(session: any) {
        session.destroy((err) => {
          if (err) {
            throw new Error('Logout failed');
          }
        });
        return { message: 'Logout successful' };
      }
    
}