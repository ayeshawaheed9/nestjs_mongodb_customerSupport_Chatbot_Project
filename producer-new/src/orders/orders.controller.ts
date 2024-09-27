import { Body, UsePipes, Controller, Param, Post, Get, UseInterceptors } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { Order } from './orders.schema';
import { pendingOrdersInterceptor } from 'src/interceptors/pendingOrderInterceptor';
import { ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { RemoveIdInterceptor } from 'src/interceptors/removeIdInterceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/place_order')
  @UsePipes(new ValidationPipe())
  async placeOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder_Direct(createOrderDto);
  }

  @Get('/get_order/:id')
  @UseInterceptors(RemoveIdInterceptor)
  async getOneOrder(@Param('id') id: string){
    return this.ordersService.getOrderById(id);
  }

  @Get('/all_orders')
  @UseInterceptors(pendingOrdersInterceptor, RemoveIdInterceptor)
  async getallorder(){
    return this.ordersService.getAllOrders();
  }
  @Post('/update_order/:id')
  async updateOrder(@Param('id') id:string ,@Body() updateData: Partial<CreateOrderDto>)
  {
    return this.ordersService.updateOrder(id, updateData);
  }
  
}
