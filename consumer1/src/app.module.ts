import {
  Module,
  forwardRef,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as redisStore from 'cache-manager-ioredis';

// Services
import { ChatHistoryService } from './chatHistoryModule/chatHistory.service';
import { DiscountService } from './discountModule/discount.service';
import { OrdersService } from './orders/orders.service';
import { ProductService } from './products/products.service';
import { SearchService } from '@searchmodule/search.service';
import { LoggingService } from './loggingModule/logging.service';
import { HuggingFaceService } from '@hugging_face/hf.service';
import { SessionRestoreMiddleware } from './middlewares/session.restore.middleware';
import { UserService } from './users/users.service';

// Controllers
import { DiscountController } from './discountModule/discount.controller';
import { OrdersController } from './orders/orders.controller';
import { ProductController } from './products/products.controller';
import { SearchController } from '@searchmodule/search.controller';
import { HuggingFaceController } from '@hugging_face/hugging_Face.controller';
import { fileUploadController } from '@fileUpload/fileUpload.controller';
import { UserController } from './users/users.controller';

// Schemas
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { User, UserSchema } from './schemas/user.schema';
import { Order, OrderSchema } from './schemas/orders.schema';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';

// Guards
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/role.guard';

//middlewares
import { LoggingMiddleware } from '@middlewares/logging.middleware';

// External Libraries/Modules
import ChartService from './Visualization/imageChart.service.js';
import { CartService } from './cart/cart.service';
import { Cart, CartSchema } from '@schemas/cart.schema';
import { CartController } from './cart/cart.controller';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      serverSelectionTimeoutMS: 30000,
    }),
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],

  controllers: [
    DiscountController,
    OrdersController,
    ProductController,
    SearchController,
    HuggingFaceController,
    fileUploadController,
    UserController,
    CartController,
    AppController
  ],

  providers: [
    // Services
    ChatHistoryService,
    DiscountService,
    OrdersService,
    ProductService,
    SearchService,
    LoggingService,
    HuggingFaceService,
    SessionRestoreMiddleware,
    UserService,
    CartService,
    AppService,
    
    // Guards
    AuthGuard,
    RolesGuard,

    // Other Providers
    ChartService,
  ],

  exports: [
    ChatHistoryService,
    DiscountService,
    OrdersService,
    ProductService,
    LoggingService,
    SessionRestoreMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware) 
      .forRoutes('*'); 
  }
}
