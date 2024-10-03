import { Body, UsePipes, Query, Controller, Param, Post, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../schemas/orders.schema';
import { pendingOrdersInterceptor } from 'src/interceptors/pendingOrderInterceptor';
import { ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { RemoveIdInterceptor } from 'src/interceptors/removeIdInterceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from 'src/guard/auth.guard';

@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  
  @Post('/place_order/:userId')
  @UsePipes(new ValidationPipe())
  async placeOrder(@Param('userId') userId: string,@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder_Direct(userId,createOrderDto);
  }

  @Get('/get_order/:orderid')
  @UseInterceptors(RemoveIdInterceptor)
  async getOneOrder(@Param('orderid') id: string){
    return this.ordersService.getOrderById(id);
  }

  @Get('/all_orders')
 // @UseInterceptors(pendingOrdersInterceptor, RemoveIdInterceptor)
  async getallorder(
    @Query('page') page: string = '1', // Default to page 1
    @Query('limit') limit: string = '10', // Default to 10 items per page
  ){
    return this.ordersService.getAllOrders(+page, +limit);
  }
  @Post('/update_order/:id')
  async updateOrder(@Param('id') id:string ,@Body() updateData: Partial<CreateOrderDto>)
  {
    return this.ordersService.updateOrder(id, updateData);
  }
  
}
