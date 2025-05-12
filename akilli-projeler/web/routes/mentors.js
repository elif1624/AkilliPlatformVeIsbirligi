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

// Tüm mentorları getir
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*, user:user_id(name, email), academic:academic_id(name, email)');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ID'ye göre mentor getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('mentors')
      .select('*, user:user_id(name, email), academic:academic_id(name, email), projects(id, title)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Mentor bulunamadı' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni mentor ata
router.post('/', async (req, res) => {
  try {
    const { user_id, academic_id, projects, expertise } = req.body;
    
    // Gerekli alanları kontrol et
    if (!user_id || !academic_id) {
      return res.status(400).json({ message: 'Kullanıcı ID ve akademisyen ID alanları zorunludur' });
    }
    
    // Kullanıcının öğrenci olduğunu kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    if (user.role !== 'student') {
      return res.status(400).json({ message: 'Sadece öğrenciler mentor olarak atanabilir' });
    }
    
    // Akademisyenin var olduğunu kontrol et
    const { data: academic, error: academicError } = await supabase
      .from('users')
      .select('role')
      .eq('id', academic_id)
      .single();
    
    if (academicError || !academic) {
      return res.status(404).json({ message: 'Akademisyen bulunamadı' });
    }
    
    if (academic.role !== 'academic') {
      return res.status(400).json({ message: 'Sadece akademisyenler mentor atayabilir' });
    }
    
    // Mentor oluştur
    const { data, error } = await supabase
      .from('mentors')
      .insert([{ 
        user_id, 
        academic_id, 
        projects, 
        expertise,
        status: 'active' 
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mentor güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projects, expertise, status } = req.body;
    
    const { data, error } = await supabase
      .from('mentors')
      .update({ projects, expertise, status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Mentor bulunamadı' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mentor sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('mentors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Mentor başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mentora proje ekle
router.post('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id } = req.body;
    
    // Gerekli alanları kontrol et
    if (!project_id) {
      return res.status(400).json({ message: 'Proje ID alanı zorunludur' });
    }
    
    // Mentorun var olduğunu kontrol et
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('projects')
      .eq('id', id)
      .single();
    
    if (mentorError || !mentor) {
      return res.status(404).json({ message: 'Mentor bulunamadı' });
    }
    
    // Projenin var olduğunu kontrol et
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();
    
    if (projectError || !project) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    
    // Projeyi mentora ekle
    const projects = mentor.projects || [];
    if (!projects.includes(project_id)) {
      projects.push(project_id);
    }
    
    const { data, error } = await supabase
      .from('mentors')
      .update({ projects })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
