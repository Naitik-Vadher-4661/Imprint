/**
 * Structured application error class for consistent error handling.
 * Use this instead of throwing plain objects like `{ statusCode, code, message }`.
 *
 * @example
 * throw new AppError('User not found', 404, 'NOT_FOUND');
 * throw AppError.badRequest('Invalid input');
 * throw AppError.unauthorized('Token expired');
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'BAD_REQUEST',
    isOperational: boolean = true,
    details: any = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Preserve proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }


  /** 400 Bad Request */
  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }

  /** 401 Unauthorized */
  static unauthorized(message: string, code = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  /** 403 Forbidden */
  static forbidden(message: string, code = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  /** 404 Not Found */
  static notFound(message: string, code = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }

  /** 409 Conflict */
  static conflict(message: string, code = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  /** 500 Internal Server Error (non-operational) */
  static internal(message: string, code = 'INTERNAL_ERROR'): AppError {
    return new AppError(message, 500, code, false);
  }
}
