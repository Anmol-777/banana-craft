import mongoose from 'mongoose';
import { toJSONOptions } from './shared.js';

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true, maxlength: 200 },
    caption: { type: String, default: '', trim: true, maxlength: 500 },
    image: { type: String, required: [true, 'Image is required'], trim: true, maxlength: 2048 },
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    layout: { type: String, enum: ['large', 'small'], default: 'small' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

galleryItemSchema.index({ order: 1 });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
