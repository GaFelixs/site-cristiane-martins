const express = require('express');
const router = express.Router();
const selectionController = require('../controllers/selectionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/toggle', authMiddleware, selectionController.toggle);
router.get('/cliente/:client_id', adminMiddleware, selectionController.getByClient);

module.exports = router;
