import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/cms.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import {
  bannerSchema, bannerUpdateSchema, heroSchema, releaseSchema, releaseUpdateSchema, reorderSchema,
} from '../validators/cms.validator.js';
import { idParam } from '../validators/common.js';

const r = Router();
const agency = [protect, authorize(ROLES.AGENCY)];

r.get('/home', h(ctrl.getHome));
r.get('/settings', ...agency, h(ctrl.getSettings));
r.put('/settings', ...agency, validate({ body: heroSchema }), h(ctrl.updateSettings));

const mountCrud = (path, crud, createSchema, updateSchema) => {
  r.get(path, ...agency, h(crud.list));
  r.post(path, ...agency, validate({ body: createSchema }), h(crud.create));
  r.put(`${path}/reorder`, ...agency, validate({ body: reorderSchema }), h(crud.reorder));
  r.patch(`${path}/:id`, ...agency, validate({ params: idParam, body: updateSchema }), h(crud.update));
  r.delete(`${path}/:id`, ...agency, validate({ params: idParam }), h(crud.remove));
};
mountCrud('/banners', ctrl.banners, bannerSchema, bannerUpdateSchema);
mountCrud('/releases', ctrl.releases, releaseSchema, releaseUpdateSchema);
export default r;
