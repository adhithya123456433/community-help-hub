const Certificate = require('../models/Certificate');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const PDFDocument = require('pdfkit');

// Get all certificates for logged in volunteer
// GET /api/certificates/my-certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    const certificates = await Certificate.find({ volunteer: volunteer._id })
      .populate('task', 'title category eventDate estimatedHours')
      .populate('ngo', 'organizationName registrationNumber city')
      .sort({ issuedAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify certificate by ID or Token
// GET /api/certificates/verify/:id
exports.verifyCertificate = async (req, res) => {
  try {
    const certId = req.params.id;
    let cert = null;

    if (certId.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(certId)
        .populate('volunteer', 'fullName city')
        .populate('task', 'title category eventDate estimatedHours')
        .populate('ngo', 'organizationName registrationNumber city');
    }

    if (!cert) {
      cert = await Certificate.findOne({ certificateToken: certId })
        .populate('volunteer', 'fullName city')
        .populate('task', 'title category eventDate estimatedHours')
        .populate('ngo', 'organizationName registrationNumber city');
    }

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found or invalid certificate identifier'
      });
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateId: cert._id,
        certificateToken: cert.certificateToken,
        volunteerName: cert.volunteer ? cert.volunteer.fullName : 'Community Volunteer',
        ngoName: cert.ngo ? cert.ngo.organizationName : 'Partner NGO',
        ngoRegistrationNumber: cert.ngo ? cert.ngo.registrationNumber : 'N/A',
        taskTitle: cert.task ? cert.task.title : 'Community Drive',
        category: cert.category,
        hoursServed: cert.hoursServed,
        eventDate: cert.task ? cert.task.eventDate : cert.issuedAt,
        issuedAt: cert.issuedAt
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Download dynamic vector PDF certificate
// GET /api/certificates/download/:id
exports.downloadCertificate = async (req, res) => {
  try {
    const certId = req.params.id;
    let cert = null;

    if (certId.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(certId)
        .populate('volunteer', 'fullName city')
        .populate('task', 'title category eventDate estimatedHours')
        .populate('ngo', 'organizationName registrationNumber city');
    }

    if (!cert) {
      cert = await Certificate.findOne({ certificateToken: certId })
        .populate('volunteer', 'fullName city')
        .populate('task', 'title category eventDate estimatedHours')
        .populate('ngo', 'organizationName registrationNumber city');
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40
    });

    const filename = `Certificate_${cert.certificateToken || cert._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Decorative Borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .strokeColor('#0f766e')
      .stroke();

    doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
      .lineWidth(1)
      .strokeColor('#14b8a6')
      .stroke();

    // Header Branding
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#0f766e')
      .text('COMMUNITYHELP HUB - INDIA', 0, 55, { align: 'center', characterSpacing: 2 });

    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#64748b')
      .text('National Grassroots Volunteering & Social Service Network', 0, 75, { align: 'center' });

    doc.moveDown(1.5);

    // Main Certificate Title
    doc.font('Helvetica-Bold')
      .fontSize(28)
      .fillColor('#0f172a')
      .text('CERTIFICATE OF APPRECIATION', { align: 'center' });

    doc.moveDown(0.5);

    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#475569')
      .text('This certificate is proudly awarded to', { align: 'center' });

    doc.moveDown(0.8);

    // Volunteer Name
    const vName = cert.volunteer ? cert.volunteer.fullName.toUpperCase() : 'COMMUNITY VOLUNTEER';
    doc.font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#0f766e')
      .text(vName, { align: 'center', underline: false });

    // Decorative underline
    const nameWidth = doc.widthOfString(vName);
    const startX = (doc.page.width - nameWidth) / 2;
    doc.moveTo(startX - 20, doc.y + 4)
      .lineTo(startX + nameWidth + 20, doc.y + 4)
      .lineWidth(1.5)
      .strokeColor('#0f766e')
      .stroke();

    doc.moveDown(1.2);

    // Citation Paragraph
    const ngoName = cert.ngo ? cert.ngo.organizationName : 'Authorized NGO';
    const regNum = cert.ngo && cert.ngo.registrationNumber ? `(Reg: ${cert.ngo.registrationNumber})` : '';
    const taskTitle = cert.task ? cert.task.title : 'Community Outreach Drive';
    const hours = cert.hoursServed || 0;
    const cat = cert.category || 'Community Service';

    const citation = `in recognition of exemplary dedication and valuable social contribution to the initiative "${taskTitle}", organized under the ${cat} sector by ${ngoName} ${regNum}. The volunteer has successfully and honorably rendered ${hours} verified service hours toward public welfare and societal upliftment.`;

    doc.font('Helvetica')
      .fontSize(11)
      .fillColor('#334155')
      .text(citation, 80, doc.y, {
        align: 'center',
        lineGap: 4,
        width: doc.page.width - 160
      });

    // Verification Metadata & Footer Signatures
    const bottomY = doc.page.height - 110;

    // Left signature: Organization Coordinator
    doc.moveTo(80, bottomY)
      .lineTo(260, bottomY)
      .lineWidth(1)
      .strokeColor('#94a3b8')
      .stroke();

    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(ngoName, 80, bottomY + 6, { width: 180, align: 'center' });

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#64748b')
      .text('Authorized Organization Lead', 80, bottomY + 20, { width: 180, align: 'center' });

    // Center: Cryptographic Seal & Verification
    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#0f766e')
      .text(`Certificate Token: ${cert.certificateToken}`, 0, bottomY + 6, { align: 'center' });

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#64748b')
      .text(`Issued: ${new Date(cert.issuedAt).toLocaleDateString('en-GB')}`, 0, bottomY + 20, { align: 'center' });

    // Right signature: CommunityHelp Hub Administration
    doc.moveTo(doc.page.width - 260, bottomY)
      .lineTo(doc.page.width - 80, bottomY)
      .lineWidth(1)
      .strokeColor('#94a3b8')
      .stroke();

    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0f172a')
      .text('CommunityHelp Hub Governance', doc.page.width - 260, bottomY + 6, { width: 180, align: 'center' });

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#64748b')
      .text('National Platform Superuser', doc.page.width - 260, bottomY + 20, { width: 180, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating certificate' });
    }
  }
};
