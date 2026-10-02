import mongoose from 'mongoose';
import { dimensionSchema, imageSchema, toJSONOptions } from './shared.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    shortDescription: { type: String, default: '', trim: true, maxlength: 400 },
    description: { type: String, default: '', trim: true, maxlength: 20000 },
    sku: { type: String, default: '', trim: true, maxlength: 80 },
    category: { type: String, default: '', trim: true, maxlength: 80, index: true },
    materials: { type: [String], default: [] },
    dimensions: { type: dimensionSchema, default: () => ({}) },
    price: { type: Number, default: null, min: 0 },
    currency: { type: String, default: 'INR', trim: true, uppercase: true, maxlength: 8 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false, index: true },
    images: { type: [imageSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
