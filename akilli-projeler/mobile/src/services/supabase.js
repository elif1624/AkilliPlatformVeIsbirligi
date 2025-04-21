import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase URL ve API anahtarını tanımla
// Not: Gerçek bir uygulamada bunları .env dosyasında saklamalısınız
const supabaseUrl = 'https://example.supabase.co';  // Örnek geçerli URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE1MzgwMCwiZXhwIjoxOTMxNzI5ODAwfQ.example';  // Örnek geçerli anahtar

// Mock Supabase istemcisi
const supabase = {
  auth: {
    signInWithPassword: async () => {
      // Başarılı giriş simülasyonu
      return {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          },
          session: {
            access_token: 'mock_token'
          }
        },
        error: null
      };
    },
    signUp: async () => {
      // Başarılı kayıt simülasyonu
      return {
        data: {
          user: {
            id: '1',
            email: 'test@example.com'
          },
          session: null
        },
        error: null
      };
    },
    signOut: async () => {
      // Başarılı çıkış simülasyonu
      return { error: null };
    },
    getUser: async () => {
      // Kullanıcı bilgisi simülasyonu
      return {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          }
        },
        error: null
      };
    },
    onAuthStateChange: () => {
      // Auth state değişikliği dinleme simülasyonu
      return {
        data: {
          unsubscribe: () => {}
        }
      };
    }
  },
  from: () => {
    return {
      select: () => {
        return {
          eq: () => {
            return {
              single: async () => {
                // Veri getirme simülasyonu
                return { data: null, error: null };
              }
            };
          }
        };
      },
      insert: async () => {
        // Veri ekleme simülasyonu
        return { data: [], error: null };
      },
      update: async () => {
        // Veri güncelleme simülasyonu
        return { data: [], error: null };
      },
      delete: async () => {
        // Veri silme simülasyonu
        return { error: null };
      }
    };
  }
};

export default supabase;
