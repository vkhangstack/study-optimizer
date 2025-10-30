import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  logger.error('Error occurred:', {
    error: message,
    statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      path: req.url,
    },
  });
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}