import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseKey, supabaseUrl } from './supabase';
import supabase from './supabase';

// API URL'sini tanımla
// Not: Gerçek bir uygulamada bunu .env dosyasında saklamalısınız
// Mobil cihazlar localhost'a erişemez, bu yüzden:
// 1. Android Emulator kullanıyorsanız: 10.0.2.2 (Android Emulator için özel IP adresi)
// 2. Gerçek cihaz kullanıyorsanız: Bilgisayarınızın yerel IP adresi (örn: 192.168.1.102)

// Kullanıcının bilgisayarının IP adresi: 192.168.1.102
// const API_URL = 'http://10.0.2.2:5000/api'; // Android Emulator için
const API_URL = 'http://192.168.1.102:5000/api'; // Gerçek cihaz için

// Axios instance oluştur
const api = axios.create({
  baseURL: supabaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
});

// İstek interceptor'ı
api.interceptors.request.use(
  async (config) => {
    try {
      // Her istekte Supabase anahtarını ekle
      config.headers.apikey = supabaseKey;
      
      // Oturum tokeni varsa ekle
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      }
      
      return config;
    } catch (error) {
      console.error('API interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token geçersiz veya yetkisiz erişim, kullanıcıyı çıkış yap
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('user');
      // Burada navigation ile login sayfasına yönlendirme yapılabilir
    }
    return Promise.reject(error);
  }
);

// API servisleri
const apiService = {
  // Kullanıcı servisleri
  users: {
    getAll: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return { data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) throw error;
      return { data };
    },
    update: async (id, userData) => {
      const { data, error } = await supabase.from('users').update(userData).eq('id', id);
      if (error) throw error;
      return { data };
    },
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
  },
  
  // Proje servisleri
  projects: {
    getAll: async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return { data };
    },
    getById: async (id) => {
      // UUID formatını kontrol et
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isUUID) {
        // Eğer UUID değilse, örnek veri döndür (geliştirme aşaması için)
        return {
          data: {
            id: id,
            title: 'Yapay Zeka ile Doğal Dil İşleme',
            description: 'Türkçe metinler için doğal dil işleme ve konu sınıflandırması yapan bir NLP projesi.',
            mentor_id: '123e4567-e89b-12d3-a456-426614174000',
            requirements: ['Python', 'NLP', 'Machine Learning'],
            max_students: 2,
            start_date: '2024-04-01',
            end_date: '2024-06-30',
            status: 'active'
          }
        };
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          mentor:mentors(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data };
    },
    create: async (projectData) => {
      const { data, error } = await supabase.from('projects').insert([projectData]);
      if (error) throw error;
      return { data };
    },
    update: async (id, projectData) => {
      const { data, error } = await supabase.from('projects').update(projectData).eq('id', id);
      if (error) throw error;
      return { data };
    },
    delete: async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    apply: (id, data) => api.post(`/projects/${id}/apply`, data),
    getApplications: (id) => api.get(`/projects/${id}/applications`),
    getMyProjects: () => api.get('/projects/my'),
    getMyApplications: () => api.get('/projects/applications/my'),
  },
  
  // Mentor servisleri
  mentors: {
    getAll: async () => {
      const { data, error } = await supabase.from('mentors').select('*');
      if (error) throw error;
      return { data };
    },
    getById: async (id) => {
      // UUID kontrolü
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isUUID) {
        // Test verisi döndür
        return {
          data: {
            id: id,
            name: 'Prof. Dr. Ali Yılmaz',
            title: 'Profesör',
            department: 'Bilgisayar Mühendisliği',
            university: 'Fırat Üniversitesi',
            expertise: ['Yapay Zeka', 'Veri Madenciliği', 'Makine Öğrenmesi'],
            projects: 8,
            students: 12,
            completedProjects: 15,
            available: true,
            lastActive: '2024-04-20'
          }
        };
      }

      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          projects:projects(count),
          students:applications(count)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data };
    },
    update: (id, data) => api.put(`/mentors/${id}`, data),
    getProfile: () => api.get('/mentors/profile'),
    updateProfile: (data) => api.put('/mentors/profile', data),
  },
  
  // Öğrenci servisleri
  students: {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    update: (id, data) => api.put(`/students/${id}`, data),
    getProfile: () => api.get('/students/profile'),
    updateProfile: (data) => api.put('/students/profile', data),
  },
  
  // Başvuru servisleri
  applications: {
    getAll: () => api.get('/applications'),
    getById: (id) => api.get(`/applications/${id}`),
    create: (data) => api.post('/applications', data),
    update: (id, data) => api.put(`/applications/${id}`, data),
    delete: (id) => api.delete(`/applications/${id}`),
    getMyApplications: () => api.get('/applications/my'),
  },
  
  // Kimlik doğrulama servisleri
  auth: {
    login: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (data.session) {
        await AsyncStorage.setItem('userSession', JSON.stringify(data.session));
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
      return { data };
    },
    register: async (userData) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            surname: userData.surname,
            role: userData.role,
          },
        },
      });
      if (error) throw error;
      
      if (data.session) {
        await AsyncStorage.setItem('userSession', JSON.stringify(data.session));
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
      return { data };
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('user');
      return { success: true };
    },
    getCurrentUser: async () => {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
  },
};

export default apiService;
