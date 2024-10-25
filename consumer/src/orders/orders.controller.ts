import { Body, UsePipes, Res, Query, Controller, Param, Post, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrdersService } from './orders.service';
import { RemoveIdInterceptor } from 'src/interceptors/removeIdInterceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from 'src/guard/auth.guard';
import { Response } from 'express'; // Ensure you import Response from express
// import ChartService = require('../Visualization/imageChart.service');
import { ValidationPipe } from '@nestjs/common';
import ChartService from 'src/Visualization/imageChart.service.js';

@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly chartService: ChartService // Inject ChartService
  ) {}

  @Post('/place_order/:userId')
  @UsePipes(new ValidationPipe())
  async placeOrder(
    @Param('userId') userId: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.createOrder_Direct(userId, createOrderDto);
  }

  @Get('/get_order/:orderid')
  @UseInterceptors(RemoveIdInterceptor)
  async getOneOrder(@Param('orderid') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('/all_orders')
  async getAllOrders(
    @Query('page') page: string = '1', // Default to page 1
    @Query('limit') limit: string = '10' // Default to 10 items per page
  ) {
    return this.ordersService.getAllOrders(+page, +limit);
  }

  @Post('/update_order/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateOrderDto>
  ) {
    return this.ordersService.updateOrder(id, updateData);
  }
  @UseInterceptors()  
  @Get('chart')
  async getOrderChart(@Res() res: Response): Promise<any> {
    try {
      const orderSummary = await this.ordersService.getOrderSummary(); // Fetch the order summary
      const chartImage = await this.chartService.generateOrderChart(orderSummary); // Generate the chart

      // Set the response type to image/png and send the chart image
      res.set('Content-Type', 'image/png');
      res.send(chartImage);
    } catch (error) {
      console.error('Error generating chart:', error);
      res.status(500).send('Error generating chart');
    }
  }
}
