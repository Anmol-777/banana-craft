const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  const data = await res.json();
  return data.data;
}

export const publicApi = {
  homepage: () => request('/settings').then(s => s.homepage || {}),
  products: () => request('/products?includeInactive=false&sort=order'),
  story: () => request('/story?includeInactive=false'),
  innovations: () => request('/innovations?includeInactive=false&sort=order'),
  gallery: () => request('/gallery?includeInactive=false&sort=order'),
  settings: () => request('/settings'),
  contact: () => request('/settings').then(s => s.contact || {}),
};

export default publicApi;