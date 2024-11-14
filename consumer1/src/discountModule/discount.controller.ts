// discount.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { DiscountService } from './discount.service';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('apply')
  applyDiscount(
    @Body('percentage') percentage: number,
    @Body('duration') duration?: number
  ): string {
    this.discountService.applyDiscount(percentage, duration);
    return `Discount of ${percentage}% applied${duration ? ' for ' + duration + ' minutes' : ''}`;
  }

  @Post('disable')
  disableDiscount(): string {
    this.discountService.disableDiscount();
    return 'Discount has been disabled';
  }
  @Get('status')
  getDiscountStatus(): any {
    return {
      discountActive: this.discountService.isDiscountActive(),
      discountPercentage: this.discountService.getDiscountPercentage(),
    };
  }
}
