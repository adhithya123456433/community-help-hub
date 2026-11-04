const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');

const inspectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_help_hub';
    await mongoose.connect(mongoUri);

    const arg = process.argv[2] ? process.argv[2].toLowerCase() : null;

    console.log('================================================================');
    console.log('  COMMUNITYHELP HUB - MONGODB DATABASE VIEWER');
    console.log('  URI: ' + mongoUri);
    console.log('================================================================');

    if (!arg) {
      // General Overview
      const usersCount = await User.countDocuments();
      const volCount = await Volunteer.countDocuments();
      const ngoCount = await NGO.countDocuments();
      const taskCount = await Task.countDocuments();
      const appCount = await Application.countDocuments();
      const certCount = await Certificate.countDocuments();

      const adminCount = await User.countDocuments({ role: 'admin' });

      console.log('\n[1] COLLECTION RECORD COUNTS:');
      console.log('----------------------------------------------------------------');
      console.log('  Collection Name   | Record Count | Description');
      console.log('--------------------+--------------+----------------------------');
      console.log(`  users             | ${String(usersCount).padEnd(12)} | Login credentials & roles`);
      console.log(`  volunteers        | ${String(volCount).padEnd(12)} | Volunteer profiles & skills`);
      console.log(`  ngos              | ${String(ngoCount).padEnd(12)} | Registered partner NGOs`);
      console.log(`  tasks             | ${String(taskCount).padEnd(12)} | Social service drives`);
      console.log(`  applications      | ${String(appCount).padEnd(12)} | Task applications & status`);
      console.log(`  certificates      | ${String(certCount).padEnd(12)} | Verified PDF certificates`);
      console.log('----------------------------------------------------------------');

      console.log('\n[2] USER ROLE BREAKDOWN:');
      console.log(`  - Volunteers: ${volCount}`);
      console.log(`  - Partner NGOs: ${ngoCount}`);
      console.log(`  - System Admins: ${adminCount}`);
      console.log(`  - Total Registered Users: ${usersCount}`);

      // Category breakdown
      const categories = [
        'Education',
        'Food distribution',
        'Environment',
        'Elder support',
        'Disaster support',
        'Community service'
      ];
      console.log('\n[3] TASKS BY MANDATORY CATEGORY:');
      for (const cat of categories) {
        const count = await Task.countDocuments({ category: cat });
        console.log(`  - ${cat.padEnd(20)}: ${count} task(s)`);
      }

      // Top 5 Leaderboard
      const topVols = await Volunteer.find().sort({ rankingPoints: -1 }).limit(5);
      console.log('\n[4] TOP 5 VOLUNTEERS (LEADERBOARD):');
      topVols.forEach((v, idx) => {
        console.log(`  ${idx + 1}. ${v.fullName} (${v.city}) - ${v.rankingPoints} pts | ${v.totalHours} hrs | ${v.completedTasksCount} completed`);
      });

      console.log('\n----------------------------------------------------------------');
      console.log('TIP: To inspect specific records, run:');
      console.log('  npm run db:view users        (Inspect all registered users)');
      console.log('  npm run db:view volunteers   (Inspect volunteer profiles)');
      console.log('  npm run db:view ngos         (Inspect registered NGOs)');
      console.log('  npm run db:view tasks        (Inspect community tasks)');
      console.log('  npm run db:view certificates (Inspect issued certificates)');
      console.log('----------------------------------------------------------------\n');
    } else if (arg === 'users') {
      const users = await User.find().sort({ role: 1, email: 1 });
      console.log(`\nALL REGISTERED USERS (${users.length} total):`);
      console.table(users.map((u) => ({
        ID: u._id.toString(),
        Email: u.email,
        PasswordHash: u.password.substring(0, 16) + '...',
        Role: u.role,
        Created: u.createdAt.toISOString().split('T')[0]
      })));
    } else if (arg === 'volunteers') {
      const vols = await Volunteer.find().sort({ rankingPoints: -1 });
      console.log(`\nALL VOLUNTEER PROFILES (${vols.length} total):`);
      console.table(vols.map((v) => ({
        Name: v.fullName,
        City: v.city,
        Points: v.rankingPoints,
        Hours: v.totalHours,
        Tasks: v.completedTasksCount,
        Skills: v.skills.slice(0, 3).join(', ')
      })));
    } else if (arg === 'ngos') {
      const ngos = await NGO.find().sort({ city: 1 });
      console.log(`\nALL REGISTERED NGOS (${ngos.length} total):`);
      console.table(ngos.map((n) => ({
        Organization: n.orgName,
        City: n.city,
        RegistrationNo: n.registrationNumber,
        Contact: n.contactPerson,
        Phone: n.phone
      })));
    } else if (arg === 'tasks') {
      const tasks = await Task.find().populate('createdBy', 'orgName').sort({ category: 1, city: 1 });
      console.log(`\nALL COMMUNITY TASKS (${tasks.length} total):`);
      console.table(tasks.map((t) => ({
        Title: t.title.slice(0, 35) + '...',
        Category: t.category,
        City: t.city,
        Status: t.status,
        Volunteers: `${t.volunteersAssigned || 0}/${t.volunteersRequired}`,
        NGO: t.createdBy ? t.createdBy.orgName.slice(0, 20) : 'N/A'
      })));
    } else if (arg === 'certificates') {
      const certs = await Certificate.find()
        .populate('volunteerId', 'fullName')
        .populate('taskId', 'title category')
        .populate('ngoId', 'orgName');
      console.log(`\nISSUED CERTIFICATES (${certs.length} total):`);
      console.table(certs.map((c) => ({
        CertID: c.certificateId,
        Volunteer: c.volunteerId ? c.volunteerId.fullName : 'N/A',
        Task: c.taskId ? c.taskId.title.slice(0, 28) + '...' : 'N/A',
        Hours: c.hoursCompleted,
        Date: c.issueDate.toISOString().split('T')[0]
      })));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[DB VIEW ERROR]', err);
    process.exit(1);
  }
};

inspectDatabase();
