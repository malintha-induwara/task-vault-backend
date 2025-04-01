import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/auth.validator';
import { forgotPassword, login, logout, refresh, register, resetPassword } from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema),login);
router.post('/refresh', refresh); 
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);
router.post('/logout', logout);

export default router;