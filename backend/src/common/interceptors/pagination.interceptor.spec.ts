import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { PaginationInterceptor } from './pagination.interceptor';

describe('PaginationInterceptor', () => {
  let interceptor: PaginationInterceptor<any>;

  beforeEach(() => {
    interceptor = new PaginationInterceptor();
  });

  it('should NOT transform standard generic responses (leave Unwrapped)', (done) => {
    const executionContext: Partial<ExecutionContext> = {};
    const callHandler: CallHandler = {
      handle: () => of({ some: 'data payload', accessToken: 'abcd' }),
    };

    interceptor.intercept(executionContext as ExecutionContext, callHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({ some: 'data payload', accessToken: 'abcd' });
        done();
      },
    });
  });

  it('should transform backend pagination envelope { data, pagination: {...} } to frontend standard { data, meta: {...} }', (done) => {
    const executionContext: Partial<ExecutionContext> = {};

    const mockResponse = {
      data: [{ id: 1, name: 'Alice' }],
      pagination: {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    };

    const callHandler: CallHandler = {
      handle: () => of(mockResponse),
    };

    interceptor.intercept(executionContext as ExecutionContext, callHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({
          data: [{ id: 1, name: 'Alice' }],
          meta: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
          },
        });
        done();
      },
    });
  });

  it('should map { items: [], total: ... } structural formats natively', (done) => {
    const executionContext: Partial<ExecutionContext> = {};

    const mockResponse = {
      items: [{ id: 1 }],
      total: 50,
      page: 2,
    };

    const callHandler: CallHandler = {
      handle: () => of(mockResponse),
    };

    interceptor.intercept(executionContext as ExecutionContext, callHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({
          data: [{ id: 1 }],
          meta: {
            total: 50,
            page: 2,
          },
        });
        done();
      },
    });
  });
});
