const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, requireVolunteer } = require('../middleware/authMiddleware');

router.get('/my-certificates', protect, requireVolunteer, certificateController.getMyCertificates);
router.get('/verify/:id', certificateController.verifyCertificate);
router.get('/download/:id', certificateController.downloadCertificate);

module.exports = router;
