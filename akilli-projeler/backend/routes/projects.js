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

// Middleware: Her istekte Supabase API anahtarını kontrol et
router.use((req, res, next) => {
  // İstek başlıklarında apikey varsa, Supabase istemcisini güncelle
  if (req.headers.apikey) {
    req.supabase = createClient(supabaseUrl, req.headers.apikey);
  } else {
    req.supabase = supabase;
  }
  next();
});

// Tüm projeleri getir
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('projects')
      .select(`
        *,
        mentor:mentors(
          id,
          title,
          department,
          expertise_areas,
          office_location,
          user:id(name, surname, email)
        )
      `);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    const formattedData = data.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      requirements: project.requirements || [],
      max_students: project.max_students,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      mentor: project.mentor ? {
        id: project.mentor.id,
        title: project.mentor.title,
        department: project.mentor.department,
        expertise_areas: project.mentor.expertise_areas,
        office_location: project.mentor.office_location,
        name: project.mentor.user?.name,
        surname: project.mentor.user?.surname,
        email: project.mentor.user?.email
      } : null
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// ID'ye göre proje getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await req.supabase
      .from('projects')
      .select(`
        *,
        mentor:mentors(
          id,
          title,
          department,
          expertise_areas,
          office_location,
          user:id(name, surname, email)
        ),
        applications(
          id,
          student_id,
          status,
          motivation_letter,
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const formattedData = {
      id: data.id,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      max_students: data.max_students,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      mentor: data.mentor ? {
        id: data.mentor.id,
        title: data.mentor.title,
        department: data.mentor.department,
        expertise_areas: data.mentor.expertise_areas,
        office_location: data.mentor.office_location,
        name: data.mentor.user?.name,
        surname: data.mentor.user?.surname,
        email: data.mentor.user?.email
      } : null,
      applications: data.applications || []
    };
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Yeni proje oluştur
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      max_students,
      start_date,
      end_date,
      mentor_id
    } = req.body;
    
    if (!title || !description || !mentor_id) {
      return res.status(400).json({ message: 'Title, description and mentor_id are required' });
    }
    
    const { data, error } = await req.supabase
      .from('projects')
      .insert([{
        title,
        description,
        requirements,
        max_students: max_students || 1,
        start_date,
        end_date,
        mentor_id,
        status: 'draft'
      }])
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(500).json({ message: 'Failed to create project' });
    }
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Proje güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      max_students,
      start_date,
      end_date,
      status
    } = req.body;
    
    const { data, error } = await req.supabase
      .from('projects')
      .update({
        title,
        description,
        requirements,
        max_students,
        start_date,
        end_date,
        status
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Proje sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supabase'deki tablo adı "projects"
    const { error } = await req.supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Projeye başvur
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, motivation_letter } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const { data, error } = await req.supabase
      .from('applications')
      .insert([{
        project_id: id,
        student_id,
        motivation_letter,
        status: 'pending'
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error applying to project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Projeye yapılan başvuruları getir
router.get('/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supabase'deki tablo adı "applications" ve sütun adları Türkçe
    const { data, error } = await req.supabase
      .from('applications')
      .select('*, student:student_id(ad, soyad, email)')
      .eq('project_id', id);
    
    if (error) throw error;
    
    // Veri yoksa boş dizi döndür
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    // Veri yapısını frontend'in beklediği formata dönüştür
    const formattedData = data.map(application => ({
      id: application.id,
      project_id: application.project_id,
      user_id: application.student_id,
      message: application.motivation_letter,
      status: application.status === 'pending' ? 'pending' : application.status,
      user: application.student ? {
        name: `${application.student.ad} ${application.student.soyad}`,
        email: application.student.email
      } : null
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching project applications:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
