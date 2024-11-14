import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Ensure quantity can't be negative
  stock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Ensure price can't be negative
  price: number;

  @IsString()
  description?: string;  // Optional description field
}
