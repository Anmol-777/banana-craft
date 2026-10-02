const API_BASE = '/api';

// Mongoose serialises documents with a virtual `id` and no `_id`.
// Admin editors expect `_id`, so mirror it to keep both working.
function withLegacyIds(payload) {
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (node.id && !node._id) node._id = node.id;
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return payload;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = { ...options.headers };
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
    throw new Error('Your session has expired. Please sign in again.');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = data?.error;
    const message = err?.message || (Array.isArray(err) ? err[0]?.message : null) || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.details = err;
    throw error;
  }
  return withLegacyIds(data);
}

export const api = {
  auth: {
    login: (identifier, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    changePassword: (current, next) => request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    }),
    updateProfile: (data) => request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  products: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/products?${qs}`);
    },
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    reorder: (items) => request('/products/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  },

  story: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/story?${qs}`);
    },
    get: (key) => request(`/story/${key}`),
    create: (data) => request('/story', { method: 'POST', body: JSON.stringify(data) }),
    update: (key, data) => request(`/story/${key}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (key) => request(`/story/${key}`, { method: 'DELETE' }),
    reorder: (items) => request('/story/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  },

  innovations: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/innovations?${qs}`);
    },
    get: (id) => request(`/innovations/${id}`),
    create: (data) => request('/innovations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/innovations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/innovations/${id}`, { method: 'DELETE' }),
    reorder: (items) => request('/innovations/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  },

  gallery: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/gallery?${qs}`);
    },
    get: (id) => request(`/gallery/${id}`),
    create: (data) => request('/gallery', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),
    reorder: (items) => request('/gallery/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  },

  media: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/media?${qs}`);
    },
    get: (id) => request(`/media/${id}`),
    upload: (files, folder = 'general', tags = []) => {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('folder', folder);
      formData.append('tags', tags.join(','));
      return request('/media', {
        method: 'POST',
        headers: {},
        body: formData,
      });
    },
    update: (id, data) => request(`/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id, force = false) => request(`/media/${id}?force=${force}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    reset: () => request('/settings/reset', { method: 'POST' }),
  },

  dashboard: {
    stats: () => request('/dashboard/stats'),
    recentActivity: () => request('/dashboard/recent-activity'),
  },
};

export default api;