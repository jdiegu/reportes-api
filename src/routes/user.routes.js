import { Router } from 'express'
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = Router()

router.post('/', createUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
