import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "src/schemas/orders.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-ioredis";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CacheModule.register(
        {
            store: redisStore,
            host: 'localhost', 
            port: 6379,
        }
      )],
    controllers: [UserController], 
    providers:[UserService]
})
export class UserModule{}