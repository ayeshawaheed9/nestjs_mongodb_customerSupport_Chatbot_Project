import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RemoveIdInterceptor } from './interceptors/removeIdInterceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors( new RemoveIdInterceptor());
  console.log('working')
  await app.listen(9000);

}
bootstrap();
