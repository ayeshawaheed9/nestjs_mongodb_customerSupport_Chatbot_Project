import { Body, Injectable } from '@nestjs/common';
import { Order, OrderDocument } from '../schemas/orders.schema';
import { UserDocument, User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { createUserDto } from 'src/dtos/create-user.dto';
import { Cache } from 'cache-manager';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { userloginDto } from 'src/dtos/user-login.dto';
import { TwilioService } from 'nestjs-twilio';
import { Twilio } from 'twilio';
@Injectable()
export class UserService {
  client = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
  constructor(
    @InjectModel(Order.name) public orderModel: Model<OrderDocument>,
    @InjectModel(User.name) public userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly twilioService: TwilioService,
  ) {}
  async createUser(user: createUserDto, role: string) {
    const saltOrRounds = 10;
    user.password = await bcrypt.hash(user.password, saltOrRounds);
    if (role !== 'admin' && role !== 'customer') {
      return {
        message: 'Role not valid',
      };
    }
    const newUser = new this.userModel(user);
    newUser.role = role;
    const savedUser = await newUser.save();
    await this.cacheManager.set(`user-${savedUser.userName}`, savedUser, 3000);

    const leanUser = savedUser.toObject();

    if (leanUser) {
      return {
        message: 'User created successfully',
      };
    }
  }
  async loginUser(credentials: userloginDto, role: string, session: any) {
    const username = credentials.userName;
    const password = credentials.password;
    if (role !== 'admin' && role !== 'customer') {
      return {
        message: 'Role not valid',
      };
    }
    console.log('username: ', username);
    const user = await this.userModel.findOne({ userName: username }).exec();
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid password');
    }
    user.isloggedIn = true;
    session.userId = user._id;
    await this.cacheManager.set(`session:${session.id}`, user._id, 3600);
    await user.save();
    console.log('New session created for user ID:', user._id);
    console.log('Session user ID:', session.userId);
    return { message: 'Login successful' };
  }
  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getUserByName(userName: string): Promise<any> {
    const cachedUser = await this.cacheManager.get<UserDocument>(
      `user-${userName}`,
    );

    if (cachedUser) {
      console.log('Cache hit:', cachedUser);
      return cachedUser;
    }
    const user = await this.userModel
      .find({ userName })
      .populate('orders')
      .lean()
      .exec();

    if (user) {
      await this.cacheManager.set(`order-${userName}`, user, 3600);
    }

    return user;
  }
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
  async logout(session: any) {
    const userId = session.userId;
    if (!userId) {
      return {
        message: 'User is not logged in.',
      };
    }
    console.log('user id in session from logout function : ', session.userId);
    await this.cacheManager.del(`session:${session.id}`);
    console.log('Session cleared from cache for user ID:', userId);
    const user = await this.userModel.findById(userId).exec();
    if (user) {
      user.isloggedIn = false;
      await user.save();
      console.log('User status updated to logged out:', user._id);
    }
    session.userId = null;

    return { message: 'Logout successful' };
  }
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  async requestOtpForPasswordReset(phoneNumber: number) {
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOtp();
    const expirationTime = new Date(Date.now() + 15000);

    user.otp = otp;
    user.otpExpiration = expirationTime;
    await user.save();

    this.client.messages
      .create({
        body: 'SMS Body, sent to the phone!',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber.toString(),
      })
      .then((message) => console.log(message.sid));
    return { message: 'OTP sent to phone number' };
  }
  async verifyOtp(phoneNumber: number, otp: string) {
    const user = await this.userModel.findOne({ phoneNumber: phoneNumber });
    console.log(user);
    if (!user || user.otp !== otp || user.otpExpiration < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    user.otp = null;
    user.otpExpiration = null;
    await user.save();
    return { message: 'OTP verified. You may now reset your password.' };
  }
  async resetPassword(phoneNumber: number, newPassword: string) {
    const user = await this.userModel.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saltOrRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltOrRounds);
    await user.save();
    return { message: 'Password reset successful' };
  }
}
