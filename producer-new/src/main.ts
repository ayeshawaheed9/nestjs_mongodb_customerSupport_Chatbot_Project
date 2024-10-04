import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import { RemoveIdInterceptor } from './interceptors/removeIdInterceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useGlobalInterceptors( new RemoveIdInterceptor());
  // Create Redis client for session store
  const redisClient = createClient({ url: 'redis://localhost:6379' });
  await redisClient.connect();

  // Create the Redis store
  const redisStore = new RedisStore({ client: redisClient });
  // Use the Redis store in express-session
  app.use(
    session({
      store: redisStore,
      secret: 'super-secret-key',  // Use a strong secret in production
      resave: false,               // Don't save session if unmodified
      saveUninitialized: false,    // Don't create session until something stored
      cookie: {
        maxAge: 60000,  
      },
    }),
  );
  console.log('working')
  await app.listen(9000);

}
bootstrap();