import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DiscountService {
  private discountPercentage: number = 0;
  private discountActive: boolean = false;
  private discountEndTime: Date | null = null;

  constructor() {}

  applyDiscount(percentage: number, durationInMinutes?: number): void {
    this.discountPercentage = percentage;
    this.discountActive = true;
    
    if (durationInMinutes) {
      const now = new Date();
      this.discountEndTime = new Date(now.getTime() + durationInMinutes * 60000);
    } else {
      this.discountEndTime = null;
    }
  }

  disableDiscount(): void {
    this.discountActive = false;
    this.discountPercentage = 0;
    this.discountEndTime = null;
  }

  getDiscountedPrice(originalPrice: number): number {
    if (this.discountActive) {
      return originalPrice - (originalPrice * this.discountPercentage) / 100;
    }
    return originalPrice;
  }

  isDiscountActive(): boolean {
    return this.discountActive;
  }

  getDiscountPercentage(): number {
    return this.discountPercentage;
  }

  @Cron('*/1 * * * *') // runs every minute to check for expiration
  handleDiscountExpiration() {
    if (this.discountEndTime && new Date() > this.discountEndTime) {
      this.disableDiscount();
    }
  }
}
