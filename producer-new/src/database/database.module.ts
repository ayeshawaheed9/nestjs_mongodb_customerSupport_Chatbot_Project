import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      serverSelectionTimeoutMS: 30000,  
    })
  ]
})
export class DatabaseModule {}
