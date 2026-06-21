import { errorHandler } from '../errorHandler';
import { AppError } from '../../utils/AppError';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../config/env', () => ({
  config: {
    NODE_ENV: 'development',
  },
}));

jest.mock('../../utils/apiResponse', () => ({
  sendError: jest.fn(),
}));

import { sendError } from '../../utils/apiResponse';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle AppError with correct status code and code', () => {
    const error = new AppError('User not found', 404, 'NOT_FOUND');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'User not found',
      404,
      'NOT_FOUND',
      expect.anything()
    );
  });

  it('should handle AppError.badRequest', () => {
    const error = AppError.badRequest('Invalid input');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'Invalid input',
      400,
      'BAD_REQUEST',
      expect.anything()
    );
  });

  it('should handle AppError.unauthorized', () => {
    const error = AppError.unauthorized('Token expired');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'Token expired',
      401,
      'UNAUTHORIZED',
      expect.anything()
    );
  });

  it('should handle AppError.conflict', () => {
    const error = AppError.conflict('Already exists');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'Already exists',
      409,
      'CONFLICT',
      expect.anything()
    );
  });

  it('should handle generic Error with default 500 status', () => {
    const error = new Error('Something went wrong') as Error & { statusCode?: number; code?: string };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'Something went wrong',
      500,
      'INTERNAL_ERROR',
      expect.anything()
    );
  });

  it('should handle generic error with custom statusCode and code', () => {
    const error = new Error('Service unavailable') as Error & { statusCode?: number; code?: string };
    error.statusCode = 503;
    error.code = 'SERVICE_UNAVAILABLE';

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(
      mockRes,
      'Service unavailable',
      503,
      'SERVICE_UNAVAILABLE',
      expect.anything()
    );
  });
});
