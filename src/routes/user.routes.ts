import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateRequest } from '../middleware/validateRequest';
import { changePassword, getMe } from '../controllers/user.controller';
import { changePasswordSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticateToken);
router.get('/me', getMe);
router.put('/password', validateRequest(changePasswordSchema), changePassword);

export default router;