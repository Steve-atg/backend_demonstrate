export class ErrorResponseDto {
  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Error message
   */
  message: string;

  /**
   * Error type/code for programmatic handling
   */
  error: string;

  /**
   * Timestamp when the error occurred
   */
  timestamp: string;

  /**
   * API path where the error occurred
   */
  path: string;

  constructor(
    statusCode: number,
    message: string,
    error: string,
    path: string,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  /**
   * Array of validation errors with field-specific details
   */
  details: ValidationErrorDetail[];

  constructor(
    statusCode: number,
    message: string,
    error: string,
    path: string,
    details: ValidationErrorDetail[],
  ) {
    super(statusCode, message, error, path);
    this.details = details;
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}
