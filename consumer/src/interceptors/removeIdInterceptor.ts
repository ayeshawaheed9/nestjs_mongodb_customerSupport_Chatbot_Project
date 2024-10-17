import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RemoveIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If data is an array (like when viewing all orders), we map over each order to remove _id
        if (Array.isArray(data)) {
          return data.map(order => {
            const { _id,__v, ...rest } = order; // Destructure _id and return the rest of the fields
            return rest;
          });
        } 
        // If the data is a single object (for single order retrieval), remove _id
        else {
          const { _id,__v, ...rest } = data;
          return rest;
        }
      })
    );
  }
}
