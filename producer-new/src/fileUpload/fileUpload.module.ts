import { Module } from '@nestjs/common';
import { fileUploadController } from './fileUpload.controller';

@Module({
  controllers: [fileUploadController], 
})
export class fileUploadModule {}
