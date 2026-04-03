import express from 'express';
import {
  getInventory,
  upsertInventory,
  updateInventoryQuantity,
  updateInventoryItem
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', upsertInventory);
router.put('/:productId/:branchId', updateInventoryQuantity);
router.post('/update', updateInventoryItem);

export default router;

