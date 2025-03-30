import express from 'express';
import { authMiddleware } from '../controllers/auth_controller';
import { verifyRole } from '../Middlewares/verifyRole';

const router = express.Router();

router.get('/admin/test', authMiddleware, verifyRole(['admin']), (req, res) => {
    res.json({ message: 'Доступ для админа подтверждён' });
  });
export default router;
