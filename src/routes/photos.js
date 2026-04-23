const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const photoController = require('../controllers/photoController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Apenas imagens JPEG, PNG ou WebP são permitidas'));
  }
});

router.post('/upload', adminMiddleware, upload.array('fotos', 100), photoController.upload);
router.get('/cliente/me', authMiddleware, photoController.getByClient);
router.get('/cliente/:client_id', adminMiddleware, photoController.getByClient);
router.delete('/:id', adminMiddleware, photoController.deletePhoto);

module.exports = router;
