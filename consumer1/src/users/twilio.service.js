const mongoose = require('mongoose');
const dotenv = require('dotenv');
const twilio = require('twilio');
import { UserSchema } from '../schemas/user.schema';
dotenv.config();

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.User = mongoose.model('User', UserSchema);
  }

  async sendOtp(phoneNumber) {
    const user = await this.User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      throw new Error('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpiration = expirationTime;
    await user.save();
    const phNo = `+92${user.phoneNumber.toString()}`;
    await this.client.messages.create({
      body: `Your OTP is: ${otp}, it expires in 30 seconds, PLEASE DONT SHARE IT WITH ANYONE`,
      to: phNo,
      from: process.env.TWILIO_MY_NUMBER,
    });

    console.log('otp sent');
    return {
      message: `otp sent to number ${phoneNumber}, otp is ${otp}`,
    };
  }
}
