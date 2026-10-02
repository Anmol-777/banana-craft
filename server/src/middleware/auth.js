import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Admin } from '../models/Admin.js';

export function signToken(admin) {
  return jwt.sign(
    {
      sub: String(admin._id ?? admin.id),
      email: admin.email,
      username: admin.username,
      role: admin.role,
      tv: admin.tokenVersion ?? 0,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  });
}

export function readBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, value] = header.split(' ');
  if (!value || scheme.toLowerCase() !== 'bearer') return null;
  return value.trim() || null;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) {
    throw ApiError.unauthorized('Provide a bearer token in the Authorization header', { code: 'MISSING_TOKEN' });
  }

  const payload = verifyToken(token);
  const admin = await Admin.findById(payload.sub);

  if (!admin) throw ApiError.unauthorized('Account no longer exists', { code: 'INVALID_SESSION' });
  if (!admin.isActive) throw ApiError.forbidden('Account is disabled', { code: 'ACCOUNT_DISABLED' });
  if ((admin.tokenVersion ?? 0) !== (payload.tv ?? 0)) {
    throw ApiError.unauthorized('Session was invalidated, sign in again', { code: 'SESSION_REVOKED' });
  }

  req.admin = admin;
  req.token = token;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyToken(token);
    const admin = await Admin.findById(payload.sub);
    if (admin && admin.isActive && (admin.tokenVersion ?? 0) === (payload.tv ?? 0)) {
      req.admin = admin;
    }
  } catch {
    req.admin = undefined;
  }
  next();
});

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.admin) {
      next(ApiError.unauthorized());
      return;
    }
    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      next(ApiError.forbidden(`This action requires one of: ${roles.join(', ')}`, { code: 'INSUFFICIENT_ROLE' }));
      return;
    }
    next();
  };
