import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import TreinoController from '../controllers/treinoController';

const router = express.Router();
const treinoController = new TreinoController();

router.post('/treinos', authMiddleware, treinoController.createTreino);

export default router;
