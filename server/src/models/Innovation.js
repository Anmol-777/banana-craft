import mongoose from 'mongoose';
import { imageSchema, toJSONOptions } from './shared.js';

const innovationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    summary: { type: String, default: '', trim: true, maxlength: 500 },
    body: { type: String, default: '', trim: true, maxlength: 20000 },
    image: { type: String, default: '', trim: true, maxlength: 2048 },
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    images: { type: [imageSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

export const Innovation = mongoose.model('Innovation', innovationSchema);
