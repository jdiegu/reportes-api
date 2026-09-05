import { Router } from 'express'
import {
  getMovementsByUser,
  getMyMovements,
} from '../controllers/balanceMovement.controller.js'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'
import { validateObjectId } from '../middleware/validateObjectId.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/me', getMyMovements)
router.get('/user/:id', validateObjectId, roleMiddleware('admin', 'boss'), getMovementsByUser)

export default router
