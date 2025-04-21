import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL'sini tanımla
// Not: Gerçek bir uygulamada bunu .env dosyasında saklamalısınız
const API_URL = 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı
api.interceptors.request.use(
  async (config) => {
    // Token varsa ekle
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 hatası varsa kullanıcıyı çıkış yap
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Burada navigasyon ile login ekranına yönlendirme yapılabilir
    }
    return Promise.reject(error);
  }
);

// API servisleri
const apiService = {
  // Kullanıcı servisleri
  users: {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
  },
  
  // Proje servisleri
  projects: {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    apply: (id, data) => api.post(`/projects/${id}/apply`, data),
    getApplications: (id) => api.get(`/projects/${id}/applications`),
  },
  
  // Mentor servisleri
  mentors: {
    getAll: () => api.get('/mentors'),
    getById: (id) => api.get(`/mentors/${id}`),
    create: (data) => api.post('/mentors', data),
    update: (id, data) => api.put(`/mentors/${id}`, data),
    delete: (id) => api.delete(`/mentors/${id}`),
    addProject: (id, data) => api.post(`/mentors/${id}/projects`, data),
  },
  
  // Kimlik doğrulama servisleri
  auth: {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    },
    getCurrentUser: async () => {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
  },
};

export default apiService;
