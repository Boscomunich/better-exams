import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { createLoggerWithContext } from 'libs/logger';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const now = Date.now();

    // Capture controller and method name
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const log = createLoggerWithContext(`${controller}.${handler}`);

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;
        log.http(`${method} ${url} ${status} - ${Date.now() - now}ms`);
      }),
    );
  }
}
