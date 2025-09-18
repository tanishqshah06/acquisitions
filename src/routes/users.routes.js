import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
  testDatabase,
} from '#controllers/users.controller.js';
import {
  authenticateToken,
  requireAdmin,
} from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/test-db', testDatabase);
router.get('/', fetchAllUsers);
router.get('/:id', fetchUserById);
router.put('/:id', authenticateToken, updateUserById);
router.delete('/:id', authenticateToken, requireAdmin, deleteUserById);

export default router;
