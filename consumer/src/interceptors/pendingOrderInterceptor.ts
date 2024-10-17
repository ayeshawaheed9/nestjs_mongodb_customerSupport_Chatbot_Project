import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class pendingOrdersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.filter(order => order.status === 'pending');
        } else {
          // If the data is a single order, check its status
          return data.status === 'pending' ? data : null; // Return null if it's not pending
        }
      }),
    );
  }
}
