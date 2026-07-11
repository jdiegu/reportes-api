import { Router } from 'express'
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateBalance,
} from '../controllers/user.controller.js'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/', roleMiddleware('admin', 'boss'), createUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', roleMiddleware('admin', 'boss'), updateUser)
router.delete('/:id', roleMiddleware('admin', 'boss'), deleteUser)
router.patch('/:id/balance', roleMiddleware('admin', 'boss'), updateBalance)

export default router
