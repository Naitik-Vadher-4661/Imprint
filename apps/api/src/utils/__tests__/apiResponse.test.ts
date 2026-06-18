import { Response } from 'express';
import { sendSuccess, sendError } from '../apiResponse';

describe('API Response Helpers', () => {
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockImplementation(() => ({
      json: jsonMock,
    }));
    mockResponse = {
      status: statusMock,
    };
  });

  describe('sendSuccess', () => {
    it('should send response with success: true and data with default status 200', () => {
      sendSuccess(mockResponse as Response, { user: 'Alice' });

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { user: 'Alice' },
      });
    });

    it('should send response with custom status code and meta details', () => {
      sendSuccess(mockResponse as Response, { id: 1 }, 201, { count: 10 });

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
        meta: { count: 10 },
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with status 400 and code BAD_REQUEST by default', () => {
      sendError(mockResponse as Response, 'Something failed');

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Something failed',
        },
      });
    });

    it('should send error response with custom code, status, and details', () => {
      sendError(mockResponse as Response, 'Not found', 404, 'RESOURCE_NOT_FOUND', { field: 'id' });

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Not found',
          details: { field: 'id' },
        },
      });
    });
  });
});
