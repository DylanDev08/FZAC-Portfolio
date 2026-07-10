import { Router } from 'express';
import {
  createCategoryController,
  createSiteTextController,
  createWorkController,
  createWorkImageController,
  deleteCategoryController,
  deleteSiteTextController,
  deleteWorkController,
  deleteWorkImageController,
  getWorkController,
  listCategoriesController,
  listSiteTextsController,
  listWorkImagesController,
  listWorksController,
  updateCategoryController,
  updateSiteTextController,
  updateWorkController,
  updateWorkImageController,
  uploadController,
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminActionLimiter } from '../middleware/security.js';

const router = Router();

function validateAdminPayload(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ ok: false, status: 400, error: 'El cuerpo debe ser un objeto válido.' });
  }
  next();
}

router.use(authMiddleware);

router.post('/uploads', adminActionLimiter, uploadController);

router.get('/works', listWorksController);
router.get('/works/:id', getWorkController);
router.post('/works', adminActionLimiter, validateAdminPayload, createWorkController);
router.put('/works/:id', adminActionLimiter, validateAdminPayload, updateWorkController);
router.delete('/works/:id', adminActionLimiter, deleteWorkController);

router.get('/categories', listCategoriesController);
router.post('/categories', adminActionLimiter, validateAdminPayload, createCategoryController);
router.put('/categories/:id', adminActionLimiter, validateAdminPayload, updateCategoryController);
router.delete('/categories/:id', adminActionLimiter, deleteCategoryController);

router.get('/site-texts', listSiteTextsController);
router.post('/site-texts', adminActionLimiter, validateAdminPayload, createSiteTextController);
router.put('/site-texts/:id', adminActionLimiter, validateAdminPayload, updateSiteTextController);
router.delete('/site-texts/:id', adminActionLimiter, deleteSiteTextController);

router.get('/work-images', listWorkImagesController);
router.post('/work-images', adminActionLimiter, validateAdminPayload, createWorkImageController);
router.put('/work-images/:id', adminActionLimiter, validateAdminPayload, updateWorkImageController);
router.delete('/work-images/:id', adminActionLimiter, deleteWorkImageController);

export default router;
