import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, throwError } from 'rxjs';

export class ErrorResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      catchError((error) => {
        const statusCode = error.status || 500;
        const message = error.message || 'Internal Server Error';

        response.status(statusCode).json({
          success: false,
          statusCode,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return throwError(() => new BadRequestException(error));
      }),
    );
  }
}
