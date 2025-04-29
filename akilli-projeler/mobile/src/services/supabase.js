import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase URL ve API anahtarını tanımla
const supabaseUrl = 'https://mmdgtacdykxjtgmepmcq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZGd0YWNkeWt4anRnbWVwbWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTQ5NjIsImV4cCI6MjA1OTU5MDk2Mn0.DnHmDQvVzeU09tIyWJVVNNYDkS3SnlTa9p5axZE29r8';

// Supabase istemcisini oluştur
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__,
  },
  global: {
    headers: {
      'apikey': supabaseKey,
    },
  },
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
