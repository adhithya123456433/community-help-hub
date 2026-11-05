require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function testPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  const emails = [
    'admin@communityhelphub.in',
    'karthik.raman@gmail.com',
    'rahul.volunteer@gmail.com',
    'senthil.kumar@gmail.com',
    'chennaiseva@ngo.org',
    'kovaigreen@ngo.org',
    'pandian@ngo.org'
  ];

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await user.comparePassword('password123');
      console.log(email, '-> password123 match:', isMatch);
    } else {
      console.log(email, 'NOT FOUND');
    }
  }

  // Create 2 additional test admins if not present
  const admin2Email = 'admin.support@communityhelphub.in';
  const admin3Email = 'admin.audit@communityhelphub.in';

  let a2 = await User.findOne({ email: admin2Email });
  if (!a2) {
    a2 = new User({ email: admin2Email, password: 'password123', role: 'admin' });
    await a2.save();
    console.log('Created Admin 2:', admin2Email);
  }

  let a3 = await User.findOne({ email: admin3Email });
  if (!a3) {
    a3 = new User({ email: admin3Email, password: 'password123', role: 'admin' });
    await a3.save();
    console.log('Created Admin 3:', admin3Email);
  }

  process.exit(0);
}

testPasswords();
