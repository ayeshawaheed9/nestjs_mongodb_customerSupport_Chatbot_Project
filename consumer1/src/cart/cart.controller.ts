import { Controller, Post, Get, Req,Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDocument } from '@schemas/cart.schema';
import { CreateOrderDto } from '@dtos/create-order.dto';
import { AuthGuard } from '@guard/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {

  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string): Promise<CartDocument> {
    return this.cartService.getCartByUserId(userId);
  }

  @Post('add/:userId')
  async addProductToCart(@Param('userId') userId: string, @Body() ProductDto: CreateOrderDto, @Req() request: any): Promise<any> {
    return this.cartService.addToCart(
      userId, ProductDto.productId, ProductDto.quantity, request.session);
  }

  @Post('remove/:userId')
  async removeProductFromCart(@Param('userId') userId: string, @Body('productId') productId: string): Promise<CartDocument> {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Post('checkout')
  async checkout(@Req() request:any): Promise<any> {
    return this.cartService.checkoutCart(request.session);
  }
}