import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    
    process.stdout.write(`\n=== INCOMING REQUEST (INTERCEPTOR) ===\n`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Body:`, JSON.stringify(body, null, 2));
    console.log(`Content-Type:`, headers['content-type']);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    return next.handle().pipe(
      tap(() => {
        process.stdout.write(`=== REQUEST COMPLETED ===\n`);
        console.log(`URL: ${url}\n`);
      }),
    );
  }
}

