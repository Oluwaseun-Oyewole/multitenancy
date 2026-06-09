import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
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
        const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse =
          error instanceof HttpException ? error.getResponse() : null;

        const message =
          typeof errorResponse === 'object' && errorResponse['message']
            ? errorResponse['message']
            : error.message || 'Internal Server Error';

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
