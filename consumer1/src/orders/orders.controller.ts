import { Body, UsePipes, Res, Query, Controller, Param, Post, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrdersService } from './orders.service';
import { RemoveIdInterceptor } from 'src/interceptors/removeIdInterceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from 'src/guard/auth.guard';
import { Response } from 'express'; 
import { ValidationPipe } from '@nestjs/common';
import ChartService from 'src/Visualization/imageChart.service.js';
import { Req } from '@nestjs/common';

@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly chartService: ChartService 
  ) {}

  @Post('/place_order/:userId')
  @UsePipes(new ValidationPipe())
  async placeOrder(
    @Param('userId') userId: string,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req:any
  ) {
    return this.ordersService.createOrder_Direct(userId, createOrderDto, req.session);
  }

  @Get('/get_order/:orderid')
  @UseInterceptors(RemoveIdInterceptor)
  async getOneOrder(@Param('orderid') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('/all_orders')
  async getAllOrders(
    @Query('page') page: string = '1', 
    @Query('limit') limit: string = '10' 
  ) {
    return this.ordersService.getAllOrders(+page, +limit);
  }

  // @Post('/update_order/:id')
  // async updateOrder(
  //   @Param('id') id: string,
  //   @Body() updateData: Partial<CreateOrderDto>
  // ) {
  //   return this.ordersService.updateOrder(id, updateData);
  // }
  
  @UseInterceptors()  
  @Get('chart')
  async getOrderChart(@Res() res: Response): Promise<any> {
    try {
      const orderSummary = await this.ordersService.getOrderSummary(); 
      const chartImage = await this.chartService.generateOrderChart(orderSummary); 
      res.set('Content-Type', 'image/png');
      res.send(chartImage);
    } catch (error) {
      console.error('Error generating chart:', error);
      res.status(500).send('Error generating chart');
    }
  }
}
