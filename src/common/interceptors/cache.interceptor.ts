import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { CacheWrapper } from '../cache/index.cache';

export class CacheInterceptor implements NestInterceptor {
  private readonly cache = new CacheWrapper<string>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = request.url;

    if (this.cache.has(cacheKey)) {
      return new Observable((observer) => {
        observer.next(this.cache.get(cacheKey));
        observer.complete();
      });
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(cacheKey, data);
      }),
    );
  }
}
