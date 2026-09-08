import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('estore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('estore_token');
      localStorage.removeItem('estore_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ============ Auth ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ============ Products ============
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/products', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => api.delete(`/products/${id}`),
};

// ============ Categories ============
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/categories', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/categories/${id}`, data);
  },
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============ Cart ============
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (product_id, quantity = 1) => api.post('/cart/add', { product_id, quantity }),
  update: (cart_item_id, quantity) => api.put('/cart/update', { cart_item_id, quantity }),
  remove: (id) => api.delete(`/cart/remove/${id}`),
  clear: () => api.delete('/cart/clear'),
};

// ============ Orders ============
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  adminGetAll: () => api.get('/orders/admin/all'),
};

// ============ Users ============
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/users/password', data),
  addAddress: (data) => api.post('/users/address', data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
  getAll: () => api.get('/users/all'),
};

// ============ Reviews ============
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  get: (params) => api.get('/reviews', { params }),
  adminGetAll: () => api.get('/reviews/admin/all'),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ============ Admin ============
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
