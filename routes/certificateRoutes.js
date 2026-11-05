const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const NGO = require('../models/NGO');
const { protect, requireVolunteer } = require('../middleware/authMiddleware');

// Get all certificates for logged-in volunteer
// GET /api/certificates/my-certificates
router.get('/my-certificates', protect, requireVolunteer, async (req, res) => {
  try {
    const certificates = await Certificate.find({ volunteerId: req.user.volunteerId })
      .populate('taskId', 'title category location dateTime')
      .populate('ngoId', 'orgName registrationNumber city contactPerson')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates',
      error: error.message
    });
  }
});

// Verify Certificate authenticity
// GET /api/certificates/verify/:id
router.get('/verify/:id', async (req, res) => {
  try {
    let certificate = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      certificate = await Certificate.findById(req.params.id)
        .populate('volunteerId', 'fullName city')
        .populate('taskId', 'title category dateTime hours')
        .populate('ngoId', 'orgName registrationNumber city contactPerson');
    }
    if (!certificate) {
      certificate = await Certificate.findOne({ certificateId: req.params.id })
        .populate('volunteerId', 'fullName city')
        .populate('taskId', 'title category dateTime hours')
        .populate('ngoId', 'orgName registrationNumber city contactPerson');
    }

    if (!certificate) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate record not found in system' });
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        volunteerName: certificate.volunteerId ? certificate.volunteerId.fullName : 'Volunteer',
        volunteerCity: certificate.volunteerId ? certificate.volunteerId.city : 'India',
        taskTitle: certificate.taskId ? certificate.taskId.title : 'Community Service Drive',
        category: certificate.taskId ? certificate.taskId.category : 'Community Service',
        ngoName: certificate.ngoId ? certificate.ngoId.orgName : 'Community Organization',
        ngoRegistration: certificate.ngoId ? certificate.ngoId.registrationNumber : 'Registered NGO',
        hoursServed: certificate.hoursCompleted || 3,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error verifying certificate',
      error: error.message
    });
  }
});

// Download Certificate as PDF (PDFKit)
// GET /api/certificates/download/:id
router.get('/download/:id', async (req, res) => {
  try {
    let certificate = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      certificate = await Certificate.findById(req.params.id)
        .populate('volunteerId', 'fullName city')
        .populate('taskId', 'title category dateTime hours')
        .populate('ngoId', 'orgName registrationNumber city contactPerson');
    }
    if (!certificate) {
      certificate = await Certificate.findOne({ certificateId: req.params.id })
        .populate('volunteerId', 'fullName city')
        .populate('taskId', 'title category dateTime hours')
        .populate('ngoId', 'orgName registrationNumber city contactPerson');
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const volunteerName = certificate.volunteerId ? certificate.volunteerId.fullName : 'Volunteer';
    const taskTitle = certificate.taskId ? certificate.taskId.title : 'Community Service Task';
    const taskCategory = certificate.taskId ? certificate.taskId.category : 'Community Service';
    const ngoName = certificate.ngoId ? certificate.ngoId.orgName : 'Community Organization';
    const regNumber = certificate.ngoId ? certificate.ngoId.registrationNumber : 'N/A';
    const hours = certificate.hoursCompleted || 3;
    const dateFormatted = new Date(certificate.issueDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Create a PDF document in landscape mode
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40
    });

    // Set response headers for PDF download
    const filename = `Certificate-${certificate.certificateId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream PDF directly to client response
    doc.pipe(res);

    // Outer Decorative Border
    doc.lineWidth(4);
    doc.strokeColor('#1b4332');
    doc.rect(25, 25, 792, 545).stroke();

    // Inner Thin Border
    doc.lineWidth(1);
    doc.strokeColor('#2d6a4f');
    doc.rect(32, 32, 778, 531).stroke();

    // Top Header: Organization / Platform
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2d6a4f');
    doc.text('COMMUNITYHELP HUB - VOLUNTEER & SOCIAL SERVICE PLATFORM', 40, 60, {
      align: 'center'
    });

    doc.moveDown(0.5);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1b4332');
    doc.text('CERTIFICATE OF APPRECIATION', {
      align: 'center'
    });

    doc.moveDown(0.6);
    doc.fontSize(12).font('Helvetica').fillColor('#555555');
    doc.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', {
      align: 'center'
    });

    // Volunteer Name
    doc.moveDown(0.8);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1b4332');
    doc.text(volunteerName.toUpperCase(), {
      align: 'center'
    });

    // Underline beneath volunteer name
    doc.moveTo(250, doc.y + 4).lineTo(592, doc.y + 4).lineWidth(1.5).strokeColor('#2d6a4f').stroke();

    // Certificate Body Text
    doc.moveDown(1.2);
    doc.fontSize(13).font('Helvetica').fillColor('#333333');
    const bodyText =
      `For meritorious dedication and selfless contribution in successfully completing ${hours} hours ` +
      `of community service for the initiative "${taskTitle}" under the category of ${taskCategory}.`;

    doc.text(bodyText, 100, doc.y, {
      align: 'center',
      width: 642,
      lineGap: 4
    });

    // Issued by NGO details
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Oblique').fillColor('#666666');
    doc.text(`Organized and Verified by: ${ngoName} (Registration No: ${regNumber})`, {
      align: 'center'
    });

    // Signatures and Metadata at Bottom
    const bottomY = 460;

    // Left: Issue Date and Certificate ID
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2d6a4f');
    doc.text('CERTIFICATE DETAILS', 60, bottomY);
    doc.fontSize(9).font('Helvetica').fillColor('#444444');
    doc.text(`Certificate ID: ${certificate.certificateId}`, 60, bottomY + 16);
    doc.text(`Issue Date: ${dateFormatted}`, 60, bottomY + 30);
    doc.text(`Status: Verified & Tamper-Proof`, 60, bottomY + 44);

    // Right: Authorized NGO Representative
    doc.moveTo(560, bottomY + 25).lineTo(740, bottomY + 25).lineWidth(1).strokeColor('#333333').stroke();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2d6a4f');
    doc.text('AUTHORIZED SIGNATORY', 560, bottomY + 32, { width: 180, align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#555555');
    doc.text(`${ngoName}`, 560, bottomY + 46, { width: 180, align: 'center' });

    // Finalize PDF file
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating certificate PDF',
      error: error.message
    });
  }
});

module.exports = router;
