import { randomBytes } from 'node:crypto';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { slugify } from '../utils/text.js';

export function generatedPassword() {
  return randomBytes(12).toString('base64url');
}

export function resolveBootstrapInput(overrides = {}) {
  const source = { ...config.bootstrapAdmin, ...overrides };
  const email = String(source.email || '').trim().toLowerCase();
  const username = slugify(source.username || (email ? email.split('@')[0] : ''), '');
  let password = String(source.password || '');

  let generated = false;
  if (!password) {
    if (config.isProduction) {
      const error = new Error(
        'No admin account exists and ADMIN_PASSWORD is not set. Set ADMIN_EMAIL and ADMIN_PASSWORD, then run "npm run seed" or start the server again.',
      );
      error.code = 'ADMIN_BOOTSTRAP_MISSING';
      throw error;
    }
    password = generatedPassword();
    generated = true;
  }

  return {
    email,
    username: username || 'admin',
    name: String(source.name || 'Site Admin').trim() || 'Site Admin',
    password,
    generated,
    role: 'admin',
  };
}

export async function ensureBootstrapAdmin(overrides = {}) {
  const existing = await Admin.estimatedDocumentCount();
  if (existing > 0) return { created: false, reason: 'admins-exist' };

  if (config.bootstrapAdmin.autoCreate === false) {
    return { created: false, reason: 'disabled' };
  }

  const input = resolveBootstrapInput(overrides);
  if (!input.email) {
    if (config.isProduction) {
      const error = new Error(
        'No admin account exists and ADMIN_EMAIL is not set. Set ADMIN_EMAIL and ADMIN_PASSWORD, then run "npm run seed" or start the server again.',
      );
      error.code = 'ADMIN_BOOTSTRAP_MISSING';
      throw error;
    }
    return { created: false, reason: 'missing-identifier' };
  }

  const admin = new Admin({ email: input.email, username: input.username, name: input.name, role: input.role });
  await admin.setPassword(input.password);
  await admin.save();

  return { created: true, admin, generatedPassword: input.generated ? input.password : null };
}
