import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../services/supabase';
import apiService from '../services/api';

// Context oluştur
const AuthContext = createContext();

// Context Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    checkUser();
    
    // Supabase auth değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user);
          await AsyncStorage.setItem('token', session.access_token);
          await AsyncStorage.setItem('user', JSON.stringify(session.user));
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Kullanıcı durumunu kontrol et
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // Önce AsyncStorage'dan kontrol et
      const currentUser = await apiService.auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Supabase'den kontrol et
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Kullanıcı durumu kontrol edilirken hata oluştu:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Giriş yap
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(data.user);
      await AsyncStorage.setItem('token', data.session.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ol
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Supabase ile kayıt ol
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Kullanıcı bilgilerini API'ye kaydet
      if (data.user) {
        await apiService.users.create({
          ...userData,
          email: data.user.email,
          auth_id: data.user.id,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Kayıt olunurken hata oluştu:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await apiService.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Context değerleri
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
