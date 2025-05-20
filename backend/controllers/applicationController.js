const Application = require('../models/Application');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Projeye başvuru yap (sadece öğrenci)
exports.applyToProject = async (req, res) => {
  try {
    const { project_id, message } = req.body;
    // Aynı projeye tekrar başvuru kontrolü
    const existing = await Application.findOne({ project_id, student_id: req.user.userId });
    if (existing) {
      return res.status(400).json({ message: 'Bu projeye zaten başvurdunuz.' });
    }
    const application = new Application({
      project_id,
      student_id: req.user.userId,
      message
    });
    await application.save();
    // Bildirim oluştur (proje sahibine)
    const project = await Project.findById(project_id).populate('owner', 'name surname');
    const ownerId = project.owner._id || project.owner;
    const student = await User.findById(req.user.userId);
    const studentName = student ? `${student.name} ${student.surname}` : 'Bir öğrenci';
    await Notification.create({
      user: ownerId,
      relatedUser: req.user.userId,
      type: 'application',
      message: `${studentName} projenize başvurdu.`,
      created_at: new Date()
    });
    console.log('Bildirim başarıyla eklendi!');
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Bir projenin başvurularını listele (sadece proje sahibi öğretmen)
exports.getApplicationsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu projenin başvurularını görme yetkiniz yok.' });
    }
    const applications = await Application.find({ project_id: req.params.projectId }).populate('student_id', 'name surname email');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Başvuruyu güncelle (onayla/mentor seç)
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }
    // Sadece proje sahibi öğretmen güncelleyebilir
    const project = await Project.findById(application.project_id);
    if (!project || project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu başvuruyu güncelleme yetkiniz yok.' });
    }
    // Önceki durumları sakla
    const prevStatus = application.status;
    const prevMentor = application.is_mentor;
    Object.assign(application, req.body); // status, is_mentor gibi alanlar güncellenebilir
    await application.save();
    // Status değişimi bildirimi
    if (prevStatus !== application.status) {
      let notifMsg = '';
      if (application.status === 'accepted') {
        notifMsg = `Başvurunuz kabul edildi: ${project.title}`;
      } else if (application.status === 'rejected') {
        notifMsg = `Başvurunuz reddedildi: ${project.title}`;
      }
      if (notifMsg) {
        await Notification.create({
          user: application.student_id,
          relatedUser: req.user.userId,
          type: 'application',
          message: notifMsg,
          project: project._id,
          created_at: new Date()
        });
      }
    }
    // Mentor atama bildirimi
    if (!prevMentor && application.is_mentor) {
      await Notification.create({
        user: application.student_id,
        relatedUser: req.user.userId,
        type: 'application',
        message: `Mentor olarak atandınız: ${project.title}`,
        project: project._id,
        created_at: new Date()
      });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Başvuruyu sil (öğrenci kendi başvurusunu silebilir)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }
    if (application.student_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu başvuruyu silme yetkiniz yok.' });
    }
    // Bildirim oluştur (proje sahibine)
    const project = await Project.findById(application.project_id).populate('owner', 'name surname');
    const ownerId = project.owner._id || project.owner;
    const student = await User.findById(req.user.userId);
    const studentName = student ? `${student.name} ${student.surname}` : 'Bir öğrenci';
    await Notification.create({
      user: ownerId,
      relatedUser: req.user.userId,
      type: 'application',
      message: `${studentName} projenizden başvurusunu geri çekti.`,
      created_at: new Date()
    });
    await application.deleteOne();
    res.json({ message: 'Başvuru silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Öğrencinin kendi başvuruları ve başvurduğu projeler
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student_id: req.user.userId })
      .populate('project_id');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// Belirli bir öğrencinin aktif projeleri
exports.getActiveProjectsOfStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Başvurusu kabul edilmiş başvuruları bul
    const applications = await Application.find({ student_id: studentId, status: 'accepted' }).populate('project_id');
    // Sadece aktif projeleri filtrele
    const activeProjects = applications
      .map(app => app.project_id)
      .filter(p => p && p.status === 'active');
    res.json(activeProjects);
  } catch (err) {
    res.status(500).json({ message: 'Projeler alınamadı', error: err.message });
  }
};
