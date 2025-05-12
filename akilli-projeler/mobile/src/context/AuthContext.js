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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
          setUser(session.user);
      } else {
          setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Kullanıcı durumunu kontrol et
  const checkUser = async () => {
    try {
      const session = supabase.auth.session();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user session:', error.message);
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
      
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(session?.user);
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ol
  const register = async (email, password, name, surname, role) => {
    try {
      setLoading(true);
      setError(null);
      
      // Register the user with Supabase Auth
      const { data: { session, user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      // Create the user profile in the public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: newUser.id,
            email,
            name,
            surname,
            role,
          }
        ]);

      if (profileError) {
        // If profile creation fails, we should delete the auth user
        await supabase.auth.admin.deleteUser(newUser.id);
        throw profileError;
      }

      setUser(newUser);
      if (session) {
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
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
      await AsyncStorage.removeItem('userSession');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error.message);
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
