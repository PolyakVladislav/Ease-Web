import express from 'express';
import { authMiddleware } from '../controllers/auth_controller';
import { verifyRole } from '../Middlewares/verifyRole';
import { updateUserRole } from '../controllers/user_controller';

const router = express.Router();

router.put('/role', authMiddleware, verifyRole(['admin']), (req, res, next) => {
  next();
}, updateUserRole);

export default router;
