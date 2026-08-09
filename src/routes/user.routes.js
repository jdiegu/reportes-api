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
import { validateObjectId } from '../middleware/validateObjectId.middleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/', roleMiddleware('admin', 'boss'), createUser)
router.get('/', roleMiddleware('admin', 'boss'), getAllUsers)
router.get('/:id', validateObjectId, getUserById)
router.put('/me', updateOwnProfile)
router.put('/:id', validateObjectId, roleMiddleware('admin', 'boss'), adminUpdateUser)
router.put('/:id/deactivate', validateObjectId, roleMiddleware('boss'), deactivateUser)
router.put('/:id/activate', validateObjectId, roleMiddleware('boss'), activateUser)
router.delete('/:id', validateObjectId, roleMiddleware('boss'), hardDeleteUser)
router.patch('/:id/balance', validateObjectId, roleMiddleware('admin', 'boss'), updateBalance)
router.patch('/:id/role', validateObjectId, roleMiddleware('boss'), updateUserRole)

export default router
