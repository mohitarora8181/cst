import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/board.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { boardItemParams, boardItemSchema, boardSchema, boardUpdateSchema } from '../validators/board.validator.js';
import { idParam } from '../validators/common.js';

const r = Router();
r.use(protect, authorize(ROLES.AGENCY));
r.get('/', h(ctrl.listBoards));
r.post('/', validate({ body: boardSchema }), h(ctrl.createBoard));
r.get('/:id', validate({ params: idParam }), h(ctrl.getBoard));
r.patch('/:id', validate({ params: idParam, body: boardUpdateSchema }), h(ctrl.updateBoard));
r.delete('/:id', validate({ params: idParam }), h(ctrl.deleteBoard));
r.post('/:id/items', validate({ params: idParam, body: boardItemSchema }), h(ctrl.addToBoard));
r.delete('/:id/items/:profileId', validate({ params: boardItemParams }), h(ctrl.removeFromBoard));
export default r;
