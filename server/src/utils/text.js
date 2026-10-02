export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value, fallback = '') {
  const base = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return base || fallback;
}

export function isSlug(value) {
  return typeof value === 'string' && slugPattern.test(value);
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function trimText(value, maxLength) {
  const text = String(value ?? '').trim();
  if (!Number.isFinite(maxLength) || text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

export function uniqueSlug(base, taken) {
  const root = slugify(base, 'item');
  if (!taken.has(root)) return root;
  let counter = 2;
  while (taken.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}
