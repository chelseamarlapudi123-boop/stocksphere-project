import express from 'express';
import { getSalesHistory, createSale } from '../controllers/salesController.js';

const router = express.Router();

router.get('/history', getSalesHistory);
router.post('/', createSale);

export default router;
