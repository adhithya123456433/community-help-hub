const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, requireVolunteer, requireNGO } = require('../middleware/authMiddleware');

router.get('/volunteer', protect, requireVolunteer, dashboardController.getVolunteerDashboard);
router.get('/ngo', protect, requireNGO, dashboardController.getNgoDashboard);
router.get('/impact', dashboardController.getImpactMetrics);
router.get('/rankings', dashboardController.getRankings);

module.exports = router;
