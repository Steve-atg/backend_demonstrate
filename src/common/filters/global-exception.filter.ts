import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../dto/error-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    this.logger.error(
      `Exception caught: ${exception}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;

        // Handle validation errors
        if (
          status === HttpStatus.BAD_REQUEST &&
          Array.isArray(responseObj.message)
        ) {
          const validationErrors = responseObj.message.map((msg: any) => {
            if (typeof msg === 'string') {
              return { field: 'unknown', message: msg };
            }
            return {
              field: msg.property || 'unknown',
              message:
                Object.values(msg.constraints || {}).join(', ') ||
                msg.message ||
                'Invalid value',
              value: msg.value,
              constraints: msg.constraints,
            };
          });

          const validationErrorResponse = new ValidationErrorResponseDto(
            status,
            'Validation failed',
            'VALIDATION_ERROR',
            request.url,
            validationErrors,
          );

          response.status(status).json(validationErrorResponse);
          return;
        }

        message = responseObj.message || 'An error occurred';
        error = responseObj.error || exception.name;
      } else {
        message = 'An error occurred';
        error = exception.name;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma errors
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = prismaError.error;
    } else if (exception instanceof Error) {
      // Handle generic errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'INTERNAL_SERVER_ERROR';

      // Log the actual error for debugging
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'UNKNOWN_ERROR';
    }

    const errorResponse = new ErrorResponseDto(
      status,
      message,
      error,
      request.url,
    );

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          message: `Duplicate entry for ${exception.meta?.target || 'field'}`,
          error: 'DUPLICATE_ENTRY',
        };
      case 'P2025': // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'RECORD_NOT_FOUND',
        };
      case 'P2003': // Foreign key constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint violation',
          error: 'FOREIGN_KEY_CONSTRAINT',
        };
      case 'P2014': // Invalid ID
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid ID provided',
          error: 'INVALID_ID',
        };
      default:
        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.message,
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          error: 'DATABASE_ERROR',
        };
    }
  }
}
