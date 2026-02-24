import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => axios.post('/api/users/login', { email, password }),
  register: (name, email, password) =>
    axios.post('/api/users/register', { name, email, password }),
  getProfile: () => axios.get('/api/users/profile'),
  updateProfile: (userData) => axios.put('/api/users/profile', userData),
  uploadAvatar: (formData) => axios.post('/api/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Categories API
export const categoriesAPI = {
  getAll: () => axios.get('/api/categories'),
  getById: (id) => axios.get(`/api/categories/${id}`),
  create: (categoryData) => axios.post('/api/categories', categoryData),
  update: (id, categoryData) => axios.put(`/api/categories/${id}`, categoryData),
  delete: (id) => axios.delete(`/api/categories/${id}`)
};

// Products API
export const productsAPI = {
  getAll: (page = 1, limit = 10, search, category, status) => {
    let url = `/api/products?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    return axios.get(url);
  },
  getById: (id) => axios.get(`/api/products/${id}`),
  create: (productData) => axios.post('/api/products', productData),
  update: (id, productData) => axios.put(`/api/products/${id}`, productData),
  delete: (id) => axios.delete(`/api/products/${id}`),
  deleteDocument: (productId, documentId) =>
    axios.delete(`/api/products/${productId}/documents/${documentId}`),
  getDashboardStats: () => axios.get('/api/products/stats/dashboard')
};

// Services API
export const servicesAPI = {
  getAll: (page = 1, limit = 10) => axios.get(`/api/services?page=${page}&limit=${limit}`),
  getByProduct: (productId, page = 1, limit = 10) => axios.get(`/api/services?product=${productId}&page=${page}&limit=${limit}`),
  getById: (id) => axios.get(`/api/services/${id}`),
  create: (serviceData) => axios.post('/api/services', serviceData),
  update: (id, serviceData) => axios.put(`/api/services/${id}`, serviceData),
  delete: (id) => axios.delete(`/api/services/${id}`),
  deleteDocument: (serviceId, documentId) =>
    axios.delete(`/api/services/${serviceId}/documents/${documentId}`),
  getUpcomingServices: () => axios.get('/api/services/upcoming')
};

export default axios;