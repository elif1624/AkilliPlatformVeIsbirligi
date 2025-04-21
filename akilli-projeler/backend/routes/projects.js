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

// Tüm projeleri getir
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, user:created_by(name, email)');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ID'ye göre proje getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('projects')
      .select('*, user:created_by(name, email), applications(id, user_id, status)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni proje oluştur
router.post('/', async (req, res) => {
  try {
    const { title, description, requirements, deadline, created_by, tags, status } = req.body;
    
    // Gerekli alanları kontrol et
    if (!title || !description || !created_by) {
      return res.status(400).json({ message: 'Başlık, açıklama ve oluşturan alanları zorunludur' });
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{ 
        title, 
        description, 
        requirements, 
        deadline, 
        created_by, 
        tags, 
        status: status || 'active' 
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proje güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, deadline, tags, status } = req.body;
    
    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, requirements, deadline, tags, status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proje sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Proje başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Projeye başvuru yap
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, message } = req.body;
    
    // Gerekli alanları kontrol et
    if (!user_id) {
      return res.status(400).json({ message: 'Kullanıcı ID alanı zorunludur' });
    }
    
    // Projenin var olduğunu kontrol et
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (projectError || !project) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    
    // Başvuruyu oluştur
    const { data, error } = await supabase
      .from('applications')
      .insert([{ 
        project_id: id, 
        user_id, 
        message,
        status: 'pending' 
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Projeye yapılan başvuruları getir
router.get('/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('applications')
      .select('*, user:user_id(name, email)')
      .eq('project_id', id);
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
