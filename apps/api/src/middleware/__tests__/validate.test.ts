import { validate, validateQuery } from '../validate';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../utils/apiResponse', () => ({
  sendError: jest.fn(),
}));

import { sendError } from '../../utils/apiResponse';

describe('validate middleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validate (body)', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().positive().optional(),
    });

    it('should call next() when body is valid', async () => {
      const mockReq = { body: { name: 'Test', email: 'test@example.com' } } as Request;

      await validate(schema)(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should return validation error when body is invalid', async () => {
      const mockReq = { body: { name: '', email: 'invalid' } } as Request;

      await validate(schema)(mockReq, mockRes as Response, mockNext);

      expect(sendError).toHaveBeenCalledWith(
        mockRes,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        expect.any(Array)
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation error when required fields are missing', async () => {
      const mockReq = { body: {} } as Request;

      await validate(schema)(mockReq, mockRes as Response, mockNext);

      expect(sendError).toHaveBeenCalledWith(
        mockRes,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        expect.any(Array)
      );
    });

    it('should pass with optional fields omitted', async () => {
      const mockReq = { body: { name: 'Test', email: 'test@example.com' } } as Request;

      await validate(schema)(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should forward non-Zod errors to next()', async () => {
      const badSchema = {
        parseAsync: jest.fn().mockRejectedValue(new Error('unexpected')),
      } as unknown as z.AnyZodObject;

      const mockReq = { body: {} } as Request;

      await validate(badSchema)(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(sendError).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      timeRange: z.enum(['week', 'month', 'year']).optional(),
    });

    it('should call next() when query params are valid', async () => {
      const mockReq = { query: { timeRange: 'month' } } as unknown as Request;

      await validateQuery(querySchema)(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return validation error on invalid query params', async () => {
      const mockReq = { query: { timeRange: 'decade' } } as unknown as Request;

      await validateQuery(querySchema)(mockReq, mockRes as Response, mockNext);

      expect(sendError).toHaveBeenCalledWith(
        mockRes,
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        expect.any(Array)
      );
    });
  });
});
