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

    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const log = createLoggerWithContext(`${controller}.${handler}`);

    const body = req.body;
    const query = req.query;
    const params = req.params;

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const status = res.statusCode;

          log.http(`${method} ${url} ${status} - ${Date.now() - now}ms`);

          // // Console log for every successful request
          // console.log(
          //   `[HTTP] ${method} ${url} ${status} - ${Date.now() - now}ms`,
          //   { params, query, body, response: data },
          // );
        },
        error: (err) => {
          const res = context.switchToHttp().getResponse();
          const status = res?.statusCode || 500;

          log.error(`${method} ${url} ${status} - Error: ${err.message}`, {
            stack: err.stack,
            params,
            query,
            body,
          });
        },
      }),
    );
  }
}
