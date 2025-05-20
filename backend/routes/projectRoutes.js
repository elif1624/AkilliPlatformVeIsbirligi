const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Proje oluştur (sadece öğretmen)
router.post('/', authMiddleware, roleMiddleware('teacher'), projectController.createProject);
// Öğretmenin kendi projeleri (başvurularla birlikte)
router.get('/my', authMiddleware, roleMiddleware('teacher'), projectController.getMyProjects);
// Tüm projeleri listele (herkes)
router.get('/', projectController.getAllProjects);
// Tek bir projeyi getir
router.get('/:id', projectController.getProjectById);
// Projeyi güncelle (sadece sahibi öğretmen)
router.put('/:id', authMiddleware, roleMiddleware('teacher'), projectController.updateProject);
// Projeyi sil (sadece sahibi öğretmen)
router.delete('/:id', authMiddleware, roleMiddleware('teacher'), projectController.deleteProject);

module.exports = router;
