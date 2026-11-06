const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, requireVolunteer, requireNGO } = require('../middleware/authMiddleware');

router.post('/apply', protect, requireVolunteer, applicationController.applyForTask);
router.get('/my-tasks', protect, requireVolunteer, applicationController.getMyApplications);
router.get('/task/:taskId', protect, requireNGO, applicationController.getTaskApplications);
router.get('/ngo/all', protect, requireNGO, applicationController.getAllNgoApplications);
router.put('/:id/status', protect, requireNGO, applicationController.updateApplicationStatus);

module.exports = router;
