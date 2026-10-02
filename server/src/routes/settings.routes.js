import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';
import { getSettings, updateSettings, resetSettings } from '../controllers/settings.controller.js';

const addressSchema = z.object({
  line1: z.string().trim().max(200).optional(),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
});

const navItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  path: z.string().trim().min(1).max(200),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

const socialLinkSchema = z.object({
  platform: z.string().trim().max(40).optional(),
  label: z.string().trim().max(80).optional(),
  url: z.string().trim().min(1).max(2048),
});

const contactSchema = z.object({
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  email: z.string().trim().max(200).optional(),
  address: addressSchema.optional(),
  mapImage: z.string().trim().max(2048).optional(),
  mapAlt: z.string().trim().max(300).optional(),
  workingHours: z.string().trim().max(200).optional(),
});

const footerSchema = z.object({
  description: z.string().trim().max(600).optional(),
  copyright: z.string().trim().max(300).optional(),
  showSocial: z.boolean().optional(),
});

const seoSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
  keywords: z.array(z.string().trim().max(80)).optional(),
  ogImage: z.string().trim().max(2048).optional(),
});

const text = (max) => z.string().trim().max(max).optional();
const image = z.string().trim().max(2048).optional();

const heroSchema = z.object({
  heading: text(500),
  defaultImage: image,
  hoverImage: image,
  imageAlt: text(300),
});

const collectionProductSchema = z.object({
  title: text(200),
  description: text(600),
  image,
  link: text(300),
});

const collectionSchema = z.object({
  heading: text(300),
  subtitle: text(1000),
  products: z.array(collectionProductSchema).max(24).optional(),
});

const homepageStorySchema = z.object({
  heading: text(300),
  body: text(4000),
  buttonText: text(120),
  buttonLink: text(300),
  image,
  imageAlt: text(300),
});

const awardsSchema = z.object({
  heading: text(300),
  subtitle: text(1000),
  image,
  imageAlt: text(300),
});

const homepageInnovationsSchema = z.object({
  heading: text(300),
  body: text(4000),
  buttonText: text(120),
  buttonLink: text(300),
  image,
  imageAlt: text(300),
});

const statSchema = z.object({
  number: text(40),
  label: text(200),
  image: z.union([z.string().trim().max(2048), z.null()]).optional(),
});

const statisticsSchema = z.object({
  stat1: statSchema.optional(),
  stat2: statSchema.optional(),
  stat3: statSchema.optional(),
});

const homepageSchema = z.object({
  hero: heroSchema.optional(),
  collectionSection: collectionSchema.optional(),
  story: homepageStorySchema.optional(),
  awards: awardsSchema.optional(),
  innovations: homepageInnovationsSchema.optional(),
  statistics: statisticsSchema.optional(),
});

export const settingsRouter = Router();

settingsRouter.get('/', getSettings);

settingsRouter.patch('/', protect, validateBody(z.object({
  brandName: z.string().trim().max(120).optional(),
  logo: z.string().trim().max(2048).optional(),
  logoAlt: z.string().trim().max(200).optional(),
  tagline: z.string().trim().max(300).optional(),
  contact: contactSchema.optional(),
  contactPageHeading: text(300),
  contactPageSubtitle: text(1000),
  nav: z.array(navItemSchema).max(20).optional(),
  social: z.array(socialLinkSchema).max(20).optional(),
  footer: footerSchema.optional(),
  seo: seoSchema.optional(),
  homepage: homepageSchema.optional(),
})), updateSettings);

settingsRouter.post('/reset', protect, resetSettings);