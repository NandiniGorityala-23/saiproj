import Product from '../models/Product.model.js';

const buildProductFilter = (user, query) => {
  const filter = { manufacturer: user._id };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find(buildProductFilter(req.user, req.query))
      .sort({ createdAt: -1 });

    res.json({ products });
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

