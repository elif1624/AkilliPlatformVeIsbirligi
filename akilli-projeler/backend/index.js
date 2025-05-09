const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Ortam değişkenlerini yükle
dotenv.config();

// Supabase istemcisini oluştur
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Express uygulamasını oluştur
const app = express();

// Middleware'leri yapılandır
app.use(cors({
  origin: '*', // Tüm kaynaklardan gelen isteklere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express.json());

// Supabase API anahtarını kontrol et
app.use((req, res, next) => {
  // Supabase API anahtarını istek başlıklarına ekle
  req.supabaseKey = supabaseKey;
  next();
});

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Akıllı Projeler ve İşbirliği Platformu API' });
});

// API rotalarını içe aktar
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/mentors', require('./routes/mentors'));

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
