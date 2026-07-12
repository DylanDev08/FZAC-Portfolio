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
  syncWorksController,
  updateCategoryController,
  updateSiteTextController,
  updateWorkController,
  updateWorkImageController,
  uploadController,
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminActionLimiter } from '../middleware/security.js';
import {
  validateCategoryPayload,
  validateSiteTextPayload,
  validateWorkImagePayload,
  validateWorkPayload,
} from '../middleware/admin-validation.js';

const router = Router();

router.use(authMiddleware);

router.post('/uploads', adminActionLimiter, uploadController);

router.get('/works', listWorksController);
router.post('/works/sync-catalog', adminActionLimiter, syncWorksController);
router.get('/works/:id', getWorkController);
router.post('/works', adminActionLimiter, validateWorkPayload, createWorkController);
router.put('/works/:id', adminActionLimiter, validateWorkPayload, updateWorkController);
router.delete('/works/:id', adminActionLimiter, deleteWorkController);

router.get('/categories', listCategoriesController);
router.post('/categories', adminActionLimiter, validateCategoryPayload, createCategoryController);
router.put('/categories/:id', adminActionLimiter, validateCategoryPayload, updateCategoryController);
router.delete('/categories/:id', adminActionLimiter, deleteCategoryController);

router.get('/site-texts', listSiteTextsController);
router.post('/site-texts', adminActionLimiter, validateSiteTextPayload, createSiteTextController);
router.put('/site-texts/:id', adminActionLimiter, validateSiteTextPayload, updateSiteTextController);
router.delete('/site-texts/:id', adminActionLimiter, deleteSiteTextController);

router.get('/work-images', listWorkImagesController);
router.post('/work-images', adminActionLimiter, validateWorkImagePayload, createWorkImageController);
router.put('/work-images/:id', adminActionLimiter, validateWorkImagePayload, updateWorkImageController);
router.delete('/work-images/:id', adminActionLimiter, deleteWorkImageController);

export default router;
