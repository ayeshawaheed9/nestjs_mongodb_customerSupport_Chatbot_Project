import { Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import * as path from 'path';

@Controller('upload')
export class fileUploadController {
  
  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File,@Res() res: Response ) {

    const filePath = path.join(process.cwd(), 'uploads', file.filename); 
    
    // Example: Read file contents if it's a text file
    // const content = fs.readFileSync(filePath, 'utf-8');
    // console.log('File Content:', content);
    
    // return { message: 'File uploaded and processed successfully', filename: file.filename };
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath); // Send file as a response
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'File not found' });
      }
}
}