import express from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';

const router = express.Router();

router.get('/', getBranches);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;
