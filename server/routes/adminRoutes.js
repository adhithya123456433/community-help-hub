const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/tasks', adminController.getAllTasks);
router.delete('/tasks/:id', adminController.deleteTask);
router.put('/tasks/:id/status', adminController.updateTaskStatus);

module.exports = router;
