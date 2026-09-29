import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

/**
 * Global response interceptor injecting platform architecture attribution headers.
 */
@Injectable()
export class AuthorWatermarkInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-Platform-Architect', 'Abubakr Muminov');
      res.setHeader(
        'X-Engineered-By',
        'Abubakr Muminov (github.com/abubakrmuminov)',
      );
      res.setHeader('X-Platform-License', 'PROPRIETARY-SIG-80A5B2EB');
    }
    return next.handle();
  }
}
