import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorType = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'An unexpected error occurred.';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { newStatus, newMessage, newErrorType } =
        this.handlePrismaError(exception);
      status = newStatus;
      message = newMessage;
      errorType = newErrorType;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (
        status === HttpStatus.BAD_REQUEST &&
        Array.isArray(exceptionResponse.message)
      ) {
        // FIX: Select the first error message from the validation array
        message = exceptionResponse.message[0] || 'Validation failed.';
        errorType = 'VALIDATION_ERROR';
      } else {
        // This handles Prisma errors thrown as HttpExceptions and other standard errors
        message = exceptionResponse.message || exception.message;
        errorType = exceptionResponse.error
          ? exceptionResponse.error.toUpperCase().replace(/[^A-Z0-9_]+/g, '_')
          : exception.constructor.name.toUpperCase();
      }
    }

    response.status(status).json({
      statusCode: status,
      error: errorType,
      // Ensure the message is always a single string before returning
      message: Array.isArray(message) ? message[0] : message,
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    const { code, meta } = error;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed.';
    let errorType = 'DATABASE_ERROR';

    switch (code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `${Array.isArray(meta?.target) ? meta?.target.join(', ') : 'field'} already exists`;
        errorType = 'UNIQUE_CONSTRAINT_FAILED';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = `${typeof meta?.modelName === 'string' ? meta.modelName : 'Record'} not found`;
        errorType = 'RECORD_NOT_FOUND';
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid foreign key reference: ${typeof meta?.field_name === 'string' ? meta.field_name : 'foreign key'}`;
        errorType = 'FOREIGN_KEY_FAILED';
        break;

      case 'P2011':
      case 'P2012':
        status = HttpStatus.BAD_REQUEST;
        message = `Required field missing or invalid value`;
        errorType = 'BAD_INPUT';
        break;

      default:
        status = HttpStatus.BAD_REQUEST;
        message = `An unexpected database error occurred (Code: ${code})`;
        errorType = 'PRISMA_UNHANDLED';
    }

    return { newStatus: status, newMessage: message, newErrorType: errorType };
  }
}
