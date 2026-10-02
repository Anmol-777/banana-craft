import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { loginSchema, changePasswordSchema, profileSchema } from '../controllers/auth.controller.js';
import { login, me, logout, changePassword, updateProfile } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), login);
authRouter.get('/me', optionalAuth, protect, me);
authRouter.post('/logout', protect, logout);
authRouter.post('/change-password', protect, validateBody(changePasswordSchema), changePassword);
authRouter.patch('/profile', protect, validateBody(profileSchema), updateProfile);