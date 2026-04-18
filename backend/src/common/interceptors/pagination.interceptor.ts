import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<T, Response<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T> | T> {
    return next.handle().pipe(
      map((response) => {
        // Safe check for null/undefined
        if (!response || typeof response !== 'object') {
          return response;
        }

        // If it carries 'pagination', remap it to 'meta' for frontend compatibility
        if (response.data !== undefined && response.pagination !== undefined) {
          return {
            data: response.data,
            meta: response.pagination,
          };
        }

        // If response is an array but wrapped in a raw paginated style { items: [], total: ... }
        if (response.items !== undefined && response.total !== undefined) {
          const { items, ...meta } = response;
          return {
            data: items,
            meta,
          };
        }

        // Leave standard endpoints Unwrapped so it doesn't break authentication tokens
        // and other direct UI mutations.
        return response;
      }),
    );
  }
}
