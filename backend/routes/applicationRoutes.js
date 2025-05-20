const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Projeye başvuru yap (sadece öğrenci)
router.post('/', authMiddleware, roleMiddleware('student'), applicationController.applyToProject);
// Bir projenin başvurularını listele (sadece proje sahibi öğretmen)
router.get('/project/:projectId', authMiddleware, roleMiddleware('teacher'), applicationController.getApplicationsByProject);
// Başvuruyu güncelle (onayla/mentor seç)
router.put('/:id', authMiddleware, roleMiddleware('teacher'), applicationController.updateApplication);
// Başvuruyu sil (sadece başvuran öğrenci)
router.delete('/:id', authMiddleware, roleMiddleware('student'), applicationController.deleteApplication);
// Öğrencinin kendi başvuruları ve başvurduğu projeler
router.get('/my', authMiddleware, roleMiddleware('student'), applicationController.getMyApplications);
// Belirli bir öğrencinin aktif projeleri
router.get('/of-student/:studentId', applicationController.getActiveProjectsOfStudent);

module.exports = router;
