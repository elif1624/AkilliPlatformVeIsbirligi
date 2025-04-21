import { createClient } from '@supabase/supabase-js';

// Supabase URL ve API anahtarını ortam değişkenlerinden al
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Supabase istemcisini oluştur
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
