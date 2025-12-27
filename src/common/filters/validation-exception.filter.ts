import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    console.log('=== VALIDATION ERROR CAUGHT ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Body:', JSON.stringify(request.body, null, 2));
    console.log('Validation Error:', exceptionResponse.message);
    console.log('Full Exception:', JSON.stringify(exceptionResponse, null, 2));

    response.status(200).json({
      response: {
        code: status,
        message: 'Validation Error',
      },
      data: {
        error: exceptionResponse.message,
      },
    });
  }
}
