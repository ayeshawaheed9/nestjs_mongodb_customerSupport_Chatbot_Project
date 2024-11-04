import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; // Import CacheModule
import { SessionRestoreMiddleware } from 'src/middlewares/session.restore.middleware';
import * as redisStore from 'cache-manager-ioredis';
@Module({
  imports: [
   CacheModule.register({
      store: redisStore, 
      host: 'localhost', 
      port: 6379, 
    }),
  ],
  providers: [SessionRestoreMiddleware],
  exports: [SessionRestoreMiddleware]
})
export class SessionRestoreModule {}
