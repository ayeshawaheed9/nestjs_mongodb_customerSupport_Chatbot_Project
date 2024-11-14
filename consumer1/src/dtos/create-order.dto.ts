import { IsString, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  productId: string; 

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;
}
