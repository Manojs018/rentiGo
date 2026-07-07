import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentigo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rentigo_token');
      localStorage.removeItem('rentigo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (idToken, role) => api.post('/auth/google', { idToken, role }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  getFavorites: () => api.get('/auth/favorites'),
  toggleFavorite: (vehicleId) => api.post(`/auth/favorites/${vehicleId}`),
};

// ── Vehicles ──────────────────────────────────
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  getMy: () => api.get('/vehicles/my'),
  add: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  toggleAvailability: (id, isAvailable) => api.put(`/vehicles/${id}/availability`, { isAvailable }),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

// ── Bookings ──────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  getOwner: () => api.get('/bookings/owner'),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
};

// ── Admin ──────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getVehicles: (params) => api.get('/admin/vehicles', { params }),
  approveVehicle: (id, data) => api.put(`/admin/vehicles/${id}/status`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
};

// ── Pricing ────────────────────────────────────
export const pricingAPI = {
  getPlans: () => api.get('/pricing'),
};

// ── Reviews ────────────────────────────────────
export const reviewAPI = {
  getForVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  add: (data) => api.post('/reviews', data),
};

// ── Notifications ─────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── Messages & Handover ───────────────────────
export const messageAPI = {
  getMessages: (bookingId) => api.get(`/messages/${bookingId}`),
  sendMessage: (bookingId, data) => api.post(`/messages/${bookingId}`, data),
  updateHandover: (bookingId, handoverDetails) => api.put(`/messages/${bookingId}/handover`, { handoverDetails }),
};

export default api;

