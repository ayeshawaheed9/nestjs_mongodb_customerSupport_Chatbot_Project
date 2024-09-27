import { IsString} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  productName: string;
    
    quantity: number;
    customerName: string;
  }
  