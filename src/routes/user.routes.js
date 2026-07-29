import { Router } from 'express'
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateOwnProfile,
  adminUpdateUser,
  deactivateUser,
  activateUser,
  hardDeleteUser,
  updateBalance,
  updateUserRole,
} from '../controllers/user.controller.js'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/', roleMiddleware('admin', 'boss'), createUser)
router.get('/', roleMiddleware('admin', 'boss'), getAllUsers)
router.get('/:id', getUserById)
router.put('/me', updateOwnProfile)
router.put('/:id', roleMiddleware('admin', 'boss'), adminUpdateUser)
router.put('/:id/deactivate', roleMiddleware('boss'), deactivateUser)
router.put('/:id/activate', roleMiddleware('boss'), activateUser)
router.delete('/:id', roleMiddleware('boss'), hardDeleteUser)
router.patch('/:id/balance', roleMiddleware('admin', 'boss'), updateBalance)
router.patch('/:id/role', roleMiddleware('boss'), updateUserRole)

export default router
