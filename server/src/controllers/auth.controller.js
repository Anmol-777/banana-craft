import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';
import { config } from '../config/env.js';
import { Admin } from '../models/index.js';
import { signToken } from '../middleware/auth.js';

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or username is required').max(200),
  password: z.string().min(1, 'Password is required').max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(10, 'New password must be at least 10 characters')
    .max(200, 'New password must be at most 200 characters')
    .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
      message: 'New password must contain at least one letter and one number',
    }),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  const admin = await Admin.findByLogin(identifier);
  const passwordMatches = admin ? await admin.verifyPassword(password) : false;

  if (!admin || !passwordMatches) {
    throw ApiError.unauthorized('Invalid credentials', { code: 'INVALID_CREDENTIALS' });
  }
  if (!admin.isActive) {
    throw ApiError.forbidden('Account is disabled', { code: 'ACCOUNT_DISABLED' });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  sendData(res, {
    token: signToken(admin),
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn,
    admin: admin.publicProfile(),
  });
});

export const me = asyncHandler(async (req, res) => {
  sendData(res, req.admin.publicProfile());
});

export const logout = asyncHandler(async (req, res) => {
  req.admin.tokenVersion = (req.admin.tokenVersion ?? 0) + 1;
  await req.admin.save();
  sendData(res, {
    revoked: true,
    strategy: 'tokenVersion',
    message: 'All tokens issued for this account before now are invalid. Discard the token on the client.',
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  const matches = admin ? await admin.verifyPassword(currentPassword) : false;
  if (!matches) {
    throw ApiError.badRequest('Current password is incorrect', { code: 'INVALID_CREDENTIALS' });
  }

  await admin.setPassword(newPassword);
  admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
  await admin.save();

  sendData(res, {
    changed: true,
    message: 'Password updated. All existing sessions were invalidated, sign in again.',
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = profileSchema.parse(req.body);
  const admin = await Admin.findByIdAndUpdate(req.admin._id, { $set: { name } }, { new: true, runValidators: true });
  sendData(res, admin.publicProfile());
});
