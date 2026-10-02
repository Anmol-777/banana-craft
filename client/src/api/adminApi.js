import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) => adminApi.post('/auth/login', { email, password }),
  me: () => adminApi.get('/auth/me'),
  logout: () => adminApi.post('/auth/logout'),
  changePassword: (data) => adminApi.post('/auth/change-password', data),
  updateProfile: (data) => adminApi.patch('/auth/profile', data),
};

export const settingsApi = {
  get: () => adminApi.get('/settings'),
  update: (data) => adminApi.patch('/settings', data),
  reset: () => adminApi.post('/settings/reset'),
};

export const productsApi = {
  list: (params) => adminApi.get('/products', { params }),
  get: (id) => adminApi.get(`/products/${id}`),
  create: (data) => adminApi.post('/products', data),
  update: (id, data) => adminApi.patch(`/products/${id}`, data),
  delete: (id) => adminApi.delete(`/products/${id}`),
  reorder: (items) => adminApi.post('/products/reorder', { items }),
};

export const storyApi = {
  list: (params) => adminApi.get('/story', { params }),
  get: (key) => adminApi.get(`/story/${key}`),
  create: (data) => adminApi.post('/story', data),
  update: (key, data) => adminApi.patch(`/story/${key}`, data),
  delete: (key) => adminApi.delete(`/story/${key}`),
  reorder: (items) => adminApi.post('/story/reorder', { items }),
};

export const innovationsApi = {
  list: (params) => adminApi.get('/innovations', { params }),
  get: (id) => adminApi.get(`/innovations/${id}`),
  create: (data) => adminApi.post('/innovations', data),
  update: (id, data) => adminApi.patch(`/innovations/${id}`, data),
  delete: (id) => adminApi.delete(`/innovations/${id}`),
  reorder: (items) => adminApi.post('/innovations/reorder', { items }),
};

export const galleryApi = {
  list: (params) => adminApi.get('/gallery', { params }),
  get: (id) => adminApi.get(`/gallery/${id}`),
  create: (data) => adminApi.post('/gallery', data),
  update: (id, data) => adminApi.patch(`/gallery/${id}`, data),
  delete: (id) => adminApi.delete(`/gallery/${id}`),
  reorder: (items) => adminApi.post('/gallery/reorder', { items }),
};

export const mediaApi = {
  list: (params) => adminApi.get('/media', { params }),
  get: (id) => adminApi.get(`/media/${id}`),
  upload: (formData) => adminApi.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => adminApi.patch(`/media/${id}`, data),
  delete: (id) => adminApi.delete(`/media/${id}`),
};

export const dashboardApi = {
  stats: () => adminApi.get('/dashboard/stats'),
  recentActivity: () => adminApi.get('/dashboard/recent-activity'),
};

export const pageContentApi = {
  list: (params) => adminApi.get('/pages', { params }),
  get: (key) => adminApi.get(`/pages/${key}`),
  create: (data) => adminApi.post('/pages', data),
  update: (key, data) => adminApi.patch(`/pages/${key}`, data),
  upsert: (key, data) => adminApi.put(`/pages/${key}`, data),
  delete: (key) => adminApi.delete(`/pages/${key}`),
  reorder: (items) => adminApi.post('/pages/reorder', { items }),
};

export default adminApi;