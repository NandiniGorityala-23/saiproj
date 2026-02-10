import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    modelNumber: {
      type: String,
      required: [true, 'Model number is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    warrantyDurationMonths: {
      type: Number,
      required: [true, 'Warranty duration is required'],
      min: [1, 'Warranty must be at least 1 month'],
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ manufacturer: 1, modelNumber: 1 }, { unique: true });
productSchema.index({ name: 'text', modelNumber: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);

