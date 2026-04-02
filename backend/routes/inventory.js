import express from 'express';
import { getInventory, upsertInventory } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', upsertInventory);

export default router;
