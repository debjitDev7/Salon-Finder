import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API service functions
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updateLocation: (data) => api.put('/auth/location', data)
};

export const salonAPI = {
    getNearby: (params) => api.get('/salons/nearby', { params }),
    getAll: (params) => api.get('/salons', { params }),
    getById: (id) => api.get(`/salons/${id}`),
    getMySalon: () => api.get('/salons/owner/my'),
    create: (data) => api.post('/salons', data),
    update: (id, data) => api.put(`/salons/${id}`, data),
    addService: (id, data) => api.post(`/salons/${id}/services`, data),
    updateService: (salonId, serviceId, data) => api.put(`/salons/${salonId}/services/${serviceId}`, data),
    deleteService: (salonId, serviceId) => api.delete(`/salons/${salonId}/services/${serviceId}`)
};

export const slotAPI = {
    getSalonSlots: (salonId, date) => api.get(`/slots/salon/${salonId}`, { params: { date } }),
    getMySlots: (params) => api.get('/slots/my', { params }),
    generate: (data) => api.post('/slots/generate', data),
    toggle: (id) => api.put(`/slots/${id}/toggle`),
    bulkToggle: (data) => api.put('/slots/bulk-toggle', data)
};

export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getMyBookings: (params) => api.get('/bookings/my', { params }),
    getUpcoming: () => api.get('/bookings/upcoming'),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
    getSalonBookings: (params) => api.get('/bookings/salon/all', { params }),
    getTodayBookings: () => api.get('/bookings/salon/today'),
    updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data)
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getSalons: (params) => api.get('/admin/salons', { params }),
    verifySalon: (id) => api.put(`/admin/salons/${id}/verify`),
    blockSalon: (id) => api.put(`/admin/salons/${id}/block`),
    unblockSalon: (id) => api.put(`/admin/salons/${id}/unblock`),
    getUsers: (params) => api.get('/admin/users', { params }),
    toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
    getBookings: (params) => api.get('/admin/bookings', { params })
};

export default api;
