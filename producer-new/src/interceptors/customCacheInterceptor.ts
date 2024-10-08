import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    // Example: Exclude all routes in a specific controller (e.g., /hugging-face)
    if (request.url.includes('/huggingface')) {
      return undefined; // This disables caching for this route
    }

    // Otherwise, use default caching logic
    return super.trackBy(context);
  }
}
