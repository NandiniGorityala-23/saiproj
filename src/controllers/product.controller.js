import Product from '../models/Product.model.js';
import { paginationMeta, parsePagination } from '../utils/pagination.js';

const buildProductFilter = (user, query) => {
  const filter = { manufacturer: user._id };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildProductFilter(req.user, req.query);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      ...paginationMeta({ total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      manufacturer: req.user._id,
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, manufacturer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      manufacturer: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
