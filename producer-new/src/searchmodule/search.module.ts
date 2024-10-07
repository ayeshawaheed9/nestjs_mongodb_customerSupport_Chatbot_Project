import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { User, UserSchema } from 'src/schemas/user.schema'; 
import { Order, OrderSchema } from 'src/schemas/orders.schema';  // Adjust the path as needed
import { RolesGuard } from 'src/guard/role.guard';
import { AuthGuard } from 'src/guard/auth.guard';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CacheModule.register(
      {
          store: redisStore,
          host: 'localhost', 
          port: 6379,
      }
    ), UserModule],
  controllers: [SearchController],
  providers: [SearchService, UserService,RolesGuard, AuthGuard],
})
export class SearchModule {}
