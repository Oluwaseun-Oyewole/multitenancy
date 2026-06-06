import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CacheWrapper } from '../cache/index.cache';

export class CacheInterceptor implements NestInterceptor {
  private cache = new CacheWrapper<string>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = request.url;

    if (this.cache.has(cacheKey)) {
      console.log('cache hit', cacheKey);
      return new Observable((observer) => {
        observer.next(this.cache.get(cacheKey));
        observer.complete();
      });
    }

    return next.handle().pipe((data: any) => {
      console.log(`cache set`);
      this.cache.set(cacheKey, data);
      return data;
    });
  }
}
