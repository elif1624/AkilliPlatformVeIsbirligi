const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

// Supabase istemcisini oluştur
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Tüm kullanıcıları getir
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ID'ye göre kullanıcı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni kullanıcı oluştur
router.post('/', async (req, res) => {
  try {
    const { name, email, role, interests } = req.body;
    
    // Gerekli alanları kontrol et
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Ad, e-posta ve rol alanları zorunludur' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, role, interests }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, interests } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ name, email, role, interests })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
