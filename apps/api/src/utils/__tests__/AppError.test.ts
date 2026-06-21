import { AppError } from '../AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Something went wrong');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeNull();
    });

    it('should create an error with custom values', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError('Custom error', 422, 'UNPROCESSABLE_ENTITY', true, details);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('UNPROCESSABLE_ENTITY');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });

    it('should have a proper stack trace', () => {
      const error = new AppError('test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('static factory methods', () => {
    it('badRequest should create 400 error', () => {
      const error = AppError.badRequest('Bad input');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Bad input');
      expect(error.isOperational).toBe(true);
    });

    it('badRequest should accept custom code', () => {
      const error = AppError.badRequest('Invalid data', 'INVALID_FORMAT');

      expect(error.code).toBe('INVALID_FORMAT');
    });

    it('unauthorized should create 401 error', () => {
      const error = AppError.unauthorized('No access');

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('No access');
    });

    it('forbidden should create 403 error', () => {
      const error = AppError.forbidden('Access denied');

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
    });

    it('notFound should create 404 error', () => {
      const error = AppError.notFound('Resource missing');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource missing');
    });

    it('conflict should create 409 error', () => {
      const error = AppError.conflict('Already exists');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Already exists');
    });

    it('internal should create 500 non-operational error', () => {
      const error = AppError.internal('Server crash');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Server crash');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('instanceof checks', () => {
    it('should be catchable as Error', () => {
      const error = AppError.notFound('test');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it('should work with try/catch', () => {
      try {
        throw AppError.badRequest('test throw');
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect((e as AppError).statusCode).toBe(400);
      }
    });
  });
});
