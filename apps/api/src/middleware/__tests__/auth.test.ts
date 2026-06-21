import { authenticate, AuthRequest } from '../auth';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

// Mock the config module
jest.mock('../../config/env', () => ({
  config: {
    JWT_SECRET: 'test-jwt-secret-key-for-testing',
  },
}));

// Mock the apiResponse utility
jest.mock('../../utils/apiResponse', () => ({
  sendError: jest.fn(),
}));

import { sendError } from '../../utils/apiResponse';

describe('authenticate middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should reject request with no authorization header', () => {
    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Authentication required', 401, 'UNAUTHORIZED');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request when authorization header does not start with Bearer', () => {
    mockReq.headers = { authorization: 'Basic some-token' };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Authentication required', 401, 'UNAUTHORIZED');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request when Bearer token is empty', () => {
    mockReq.headers = { authorization: 'Bearer ' };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Authentication required', 401, 'UNAUTHORIZED');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() on valid token', () => {
    const token = jwt.sign({ userId: 'user-123' }, 'test-jwt-secret-key-for-testing');
    mockReq.headers = { authorization: `Bearer ${token}` };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user!.userId).toBe('user-123');
    expect(mockNext).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });

  it('should reject expired tokens with TOKEN_EXPIRED code', () => {
    const token = jwt.sign({ userId: 'user-123' }, 'test-jwt-secret-key-for-testing', { expiresIn: '-10s' });
    mockReq.headers = { authorization: `Bearer ${token}` };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Token expired', 401, 'TOKEN_EXPIRED');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject tokens signed with a different secret', () => {
    const token = jwt.sign({ userId: 'user-123' }, 'wrong-secret-key');
    mockReq.headers = { authorization: `Bearer ${token}` };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Invalid token', 401, 'INVALID_TOKEN');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject malformed tokens', () => {
    mockReq.headers = { authorization: 'Bearer not.a.valid.jwt.token' };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendError).toHaveBeenCalledWith(mockRes, 'Invalid token', 401, 'INVALID_TOKEN');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
