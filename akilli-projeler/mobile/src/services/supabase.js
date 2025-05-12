import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase URL ve API anahtarını ortam değişkenlerinden al
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Supabase istemcisini oluştur
const supabase = createClient(supabaseUrl, supabaseKey, {
  localStorage: AsyncStorage,
  detectSessionInUrl: false,
});

// Auth state değişikliklerini dinle
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await AsyncStorage.setItem('userSession', JSON.stringify(session));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
  } else if (event === 'SIGNED_OUT') {
    await AsyncStorage.removeItem('userSession');
    await AsyncStorage.removeItem('user');
  }
});

export default supabase;
export { supabaseUrl, supabaseKey };
