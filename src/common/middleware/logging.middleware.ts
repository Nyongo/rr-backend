import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use process.stdout.write for immediate output
    process.stdout.write('\n═══════════════════════════════════════════════════════\n');
    process.stdout.write('🔵 REQUEST RECEIVED (NestJS Middleware)\n');
    process.stdout.write('═══════════════════════════════════════════════════════\n');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('Body:', JSON.stringify(req.body || {}, null, 2));
    console.log('Query:', JSON.stringify(req.query || {}, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    process.stdout.write('═══════════════════════════════════════════════════════\n\n');
    next();
  }
}

