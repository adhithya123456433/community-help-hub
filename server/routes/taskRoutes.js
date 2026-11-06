const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, requireNGO } = require('../middleware/authMiddleware');

router.post('/', protect, requireNGO, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/matching/skills', protect, taskController.getMatchingSkills);
router.get('/matching/location', protect, taskController.getMatchingLocation);
router.get('/recommendations/ai', protect, taskController.getRecommendationsAI);
router.get('/:id', taskController.getTaskById);
router.put('/:id', protect, requireNGO, taskController.updateTask);
router.delete('/:id', protect, requireNGO, taskController.deleteTask);

module.exports = router;
