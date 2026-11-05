require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');

async function listDemoCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('=== ADMIN ACCOUNTS ===');
    const admins = await User.find({ role: 'admin' });
    admins.forEach((a, idx) => {
      console.log(`[Admin ${idx + 1}] Email: ${a.email} | Role: ${a.role}`);
    });

    console.log('\n=== TOP 3 VOLUNTEERS ===');
    const vols = await Volunteer.find().sort({ rankingPoints: -1 }).limit(3).populate('userId');
    vols.forEach((v, idx) => {
      console.log(`[Volunteer ${idx + 1}] Name: ${v.fullName} | Email: ${v.userId ? v.userId.email : 'N/A'} | City: ${v.city} | Points: ${v.rankingPoints} | Tasks Completed: ${v.completedTasksCount} | Skills: ${v.skills.slice(0, 3).join(', ')}`);
    });

    console.log('\n=== 3 ACTIVE NGOS ===');
    const ngos = await NGO.find().limit(3).populate('userId');
    ngos.forEach((n, idx) => {
      console.log(`[NGO ${idx + 1}] Name: ${n.orgName} | Email: ${n.userId ? n.userId.email : 'N/A'} | City: ${n.city} | Reg No: ${n.registrationNumber}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listDemoCredentials();
