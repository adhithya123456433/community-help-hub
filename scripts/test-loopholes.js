require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');

async function testLoopholes() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // 1. Check a filled task
    const sampleTask = await Task.findOne();
    console.log(`Sample Task: "${sampleTask.title}" - Assigned: ${sampleTask.volunteersAssigned} / Required: ${sampleTask.volunteersRequired}`);

    // 2. Verify all volunteer points match (completedTasksCount * 10) + (totalHours * 2)
    const volunteers = await Volunteer.find();
    let mismatches = 0;
    volunteers.forEach(v => {
      const expected = (v.completedTasksCount * 10) + (v.totalHours * 2);
      if (v.rankingPoints !== expected) {
        console.log(`Mismatch on ${v.fullName}: points=${v.rankingPoints}, expected=${expected}`);
        mismatches++;
      }
    });
    console.log(`Volunteer Points Reconciliation: ${volunteers.length} volunteers checked, ${mismatches} mismatches`);

    // 3. Verify Certificate ID lookup
    const sampleCert = await Certificate.findOne();
    if (sampleCert) {
      console.log(`Sample Certificate: ID=${sampleCert.certificateId}, Hours=${sampleCert.hoursCompleted}`);
      const certById = await Certificate.findOne({ certificateId: sampleCert.certificateId });
      if (certById) {
        console.log('Certificate lookup by readable ID verified successfully');
      }
    }

    console.log('All loophole test checks completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error testing loopholes:', error);
    process.exit(1);
  }
}

testLoopholes();
