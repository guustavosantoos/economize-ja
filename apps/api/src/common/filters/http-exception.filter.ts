import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      data: null,
      message: typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as any).message || exception.message
          : exception.message,
      error: typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as any).error
          : null,
      statusCode: status,
    });
  }
}
