import express from 'express';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.route('/')
  .get(listProducts)
  .post(createProduct);

router.route('/:id')
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;

