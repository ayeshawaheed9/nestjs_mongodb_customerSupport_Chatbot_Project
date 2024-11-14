import { Controller, Post, Get, Param, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './products.service';
import { Product } from 'src/schemas/product.schema';
import { AddProductDto } from 'src/dtos/addProduct.dto';
import { RolesGuard } from 'src/guard/role.guard';

@UseGuards(RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/add')
  async addProduct(@Body()product: AddProductDto ) {
    return this.productService.addProduct(product);
  }
  @Post('restock/:id')
  async restockProduct(@Param('id') productId: string, @Body() body: { quantity: number }) {
    return this.productService.restockProduct(productId, body.quantity);
  }
  @Get('/')
  async getAllProducts(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  async getProductById(@Param('id') productId: string): Promise<Product> {
    return this.productService.getProductById(productId);
  }

  @Put('/:id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() updates: Partial<Product>
  ): Promise<Product> {
    return this.productService.updateProduct(productId, updates);
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') productId: string): Promise<any> {
    return this.productService.deleteProduct(productId);
  }
}
