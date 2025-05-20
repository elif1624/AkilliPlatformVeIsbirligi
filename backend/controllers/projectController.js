const Project = require('../models/Project');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Proje oluştur (sadece öğretmen)
exports.createProject = async (req, res) => {
  try {
    const { title, description, start_date, end_date, max_students, estimated_months } = req.body;
    const project = new Project({
      title,
      description,
      owner: req.user.id,
      start_date,
      end_date,
      max_students,
      estimated_months
    });
    await project.save();
    // Diğer öğretmenlere bildirim oluştur
    const otherTeachers = await User.find({ role: 'teacher', _id: { $ne: req.user.id } });
    await Promise.all(otherTeachers.map(t => Notification.create({
      user: t._id,
      type: 'project',
      message: `${req.user.name || 'Bir öğretmen'} yeni bir proje oluşturdu: ${title}`,
      project: project._id,
      created_at: new Date()
    })));
    // Tüm öğrencilere bildirim oluştur
    const allStudents = await User.find({ role: 'student' });
    await Promise.all(allStudents.map(s => Notification.create({
      user: s._id,
      type: 'project',
      message: `Yeni bir proje eklendi: ${title}`,
      project: project._id,
      created_at: new Date()
    })));
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Tüm projeleri listele (herkes)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'name surname email role');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Tek bir projeyi getir
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name surname email role');
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Projeyi güncelle (sadece sahibi öğretmen)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }
    if (String(project.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Bu projeyi güncelleme yetkiniz yok.' });
    }
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Projeyi sil (sadece sahibi öğretmen)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }
    if (String(project.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Bu projeyi silme yetkiniz yok.' });
    }
    try {
      // Önce projeye ait başvuruları sil
      await Application.deleteMany({ project_id: project._id });
      await project.deleteOne();
      // Bildirim gönder
      const allTeachers = await User.find({ role: 'teacher' });
      const allStudents = await User.find({ role: 'student' });
      const notifyMsg = `Bir proje silindi: ${project.title}`;
      await Promise.all([
        ...allTeachers.map(t => Notification.create({
          user: t._id,
          type: 'project',
          message: notifyMsg,
          project: project._id,
          created_at: new Date()
        })),
        ...allStudents.map(s => Notification.create({
          user: s._id,
          type: 'project',
          message: notifyMsg,
          project: project._id,
          created_at: new Date()
        })),
      ]);
    } catch (removeErr) {
      console.error('Remove error:', removeErr);
      throw removeErr;
    }
    res.json({ message: 'Proje silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId }).populate('owner', 'name surname email');
    const projectsWithApplications = await Promise.all(projects.map(async (project) => {
      const applications = await Application.find({ project_id: project._id })
        .populate('student_id', 'name surname email');
      return {
        ...project.toObject(),
        applications
      };
    }));
    res.json(projectsWithApplications);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};
