import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { toJSONOptions } from './shared.js';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
      match: [/^[a-z0-9._-]+$/, 'Username may only contain letters, numbers, dot, underscore or hyphen'],
    },
    name: { type: String, default: 'Admin', trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0, min: 0 },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

adminSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(String(plainPassword), config.bcryptRounds);
  this.passwordChangedAt = new Date();
};

adminSchema.methods.verifyPassword = function verifyPassword(plainPassword) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(String(plainPassword ?? ''), this.passwordHash);
};

adminSchema.methods.publicProfile = function publicProfile() {
  return {
    id: String(this._id),
    email: this.email,
    username: this.username,
    name: this.name,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt ?? null,
    createdAt: this.createdAt ?? null,
    updatedAt: this.updatedAt ?? null,
  };
};

adminSchema.statics.findByLogin = function findByLogin(identifier) {
  const value = String(identifier ?? '').trim().toLowerCase();
  return this.findOne({ $or: [{ email: value }, { username: value }] }).select('+passwordHash');
};

export const Admin = mongoose.model('Admin', adminSchema);
