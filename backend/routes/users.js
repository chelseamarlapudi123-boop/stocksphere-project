import express from 'express';
import { getUsers, addUser, updateUser, deleteUser, toggleUserStatus, syncUser } from '../controllers/userController.js';

// Basic middleware to check token presence (Requirement 3: Check Auth Middleware)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }
  // In a real app we would verify jwt here.
  next();
};

const router = express.Router();

router.get('/', requireAuth, getUsers);
router.post('/', requireAuth, addUser);
router.put('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser);
router.patch('/:id/status', requireAuth, toggleUserStatus);
router.post('/sync', syncUser); // Unprotected so login sync works easily

export default router;
