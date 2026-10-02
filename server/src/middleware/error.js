import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

function duplicateKeyDetails(error) {
  const keys = Object.keys(error.keyPattern || error.keyValue || {});
  return keys.length > 0 ? { fields: keys } : undefined;
}

function normalize(error) {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((entry) => ({
      field: entry.path,
      message: entry.message,
    }));
    return ApiError.unprocessable('Validation failed', { code: 'VALIDATION_ERROR', details });
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${error.path}"`, {
      code: 'INVALID_IDENTIFIER',
      details: [{ field: error.path, message: `Expected ${error.kind}` }],
    });
  }

  if (error instanceof mongoose.Error.DocumentNotFoundError) {
    return ApiError.notFound('Resource not found');
  }

  if (error && error.code === 11000) {
    return ApiError.conflict('A record with the same unique value already exists', {
      code: 'DUPLICATE_KEY',
      details: duplicateKeyDetails(error),
    });
  }

  if (error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError')) {
    return ApiError.unauthorized(
      error.name === 'TokenExpiredError' ? 'Session expired, sign in again' : 'Invalid authentication token',
      { code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN' },
    );
  }

  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    const message = tooLarge
      ? `File is larger than the ${config.maxUploadMb} MB upload limit`
      : `Upload rejected: ${error.message}`;
    return new ApiError(tooLarge ? 413 : 400, message, { code: error.code });
  }

  if (error && error.type === 'entity.too.large') {
    return new ApiError(413, `Request body is larger than the ${config.jsonLimit} limit`, { code: 'PAYLOAD_TOO_LARGE' });
  }

  if (error && (error.type === 'entity.parse.failed' || error instanceof SyntaxError)) {
    return ApiError.badRequest('Request body is not valid JSON', { code: 'INVALID_JSON' });
  }

  if (error instanceof mongoose.Error.MongooseServerSelectionError) {
    return new ApiError(503, 'Database is unavailable, retry shortly', { code: 'DATABASE_UNAVAILABLE' });
  }

  if (error && error.code === 'ENV_INVALID') {
    return new ApiError(500, error.message, { code: 'ENV_INVALID' });
  }

  return new ApiError(500, config.isProduction ? 'Internal server error' : error?.message || 'Internal server error', {
    code: 'INTERNAL_ERROR',
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const apiError = normalize(error);

  if (apiError.status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error);
  } else if (config.logLevel === 'debug') {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${apiError.status} ${apiError.message}`);
  }

  const body = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  if (apiError.details !== undefined) body.error.details = apiError.details;
  if (!config.isProduction && apiError.status >= 500 && error?.stack) body.error.stack = error.stack;

  res.status(apiError.status).json(body);
}
