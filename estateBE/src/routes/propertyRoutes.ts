import express from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUniqueCities,
  getPropertyStats,
} from '../controllers/propertyController';

const router = express.Router();

router.get('/properties', getProperties);
router.get('/properties/cities', getUniqueCities);
router.get('/properties/stats', getPropertyStats);
router.get('/properties/:id', getPropertyById);

router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

export default router;