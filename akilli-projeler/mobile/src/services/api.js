import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseKey, supabaseUrl } from './supabase';
import supabase from './supabase';
import { Alert } from 'react-native';

// API URL'sini ortam değişkeninden al
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Bağlantı kontrolü
const checkConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.status === 200;
  } catch (error) {
    console.error('API Bağlantı Hatası:', error);
    Alert.alert(
      'Bağlantı Hatası',
      'API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.'
    );
    return false;
  }
};

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// İstek interceptor'ı
api.interceptors.request.use(
  async (config) => {
    // Bağlantı kontrolü
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('API bağlantısı yok');
    }

    // Token varsa ekle
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Hata mesajını kullanıcıya göster
    let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (error.response) {
      // Sunucu yanıt verdi ama hata kodu döndü
      switch (error.response.status) {
        case 401:
          await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
          errorMessage = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.';
          break;
        case 404:
          errorMessage = 'İstenen kaynak bulunamadı.';
          break;
        case 500:
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
          break;
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    }

    Alert.alert('Hata', errorMessage);
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
