const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Volunteer = require('./models/Volunteer');
const NGO = require('./models/NGO');
const Task = require('./models/Task');
const Application = require('./models/Application');
const Certificate = require('./models/Certificate');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_help_hub';
    await mongoose.connect(mongoUri);
    console.log('[SEED] Connected to MongoDB for pan-India and Tamil Nadu seeding');

    // Clear existing collections and indexes
    try {
      await mongoose.connection.collection('users').drop();
      await mongoose.connection.collection('volunteers').drop();
      await mongoose.connection.collection('ngos').drop();
      await mongoose.connection.collection('tasks').drop();
      await mongoose.connection.collection('applications').drop();
      await mongoose.connection.collection('certificates').drop();
    } catch (err) {
      // Collections might not exist yet, safe to ignore
    }
    console.log('[SEED] Cleared existing records and indexes');

    // ==============================================================
    // 1. CREATE ADMIN USER
    // ==============================================================
    const adminUser = new User({
      email: 'admin@communityhelphub.in',
      password: 'password123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('[SEED] Created Admin account: admin@communityhelphub.in');

    // ==============================================================
    // 2. CREATE 19 NGOS (TAMIL NADU + PAN-INDIA)
    // ==============================================================

    const ngosData = [
      // Tamil Nadu NGOs
      {
        email: 'chennaiseva@ngo.org',
        orgName: 'Kavalar Youth Welfare Foundation',
        registrationNumber: 'NGO-TN-2021-00744',
        contactPerson: 'S. Ramanathan',
        phone: '9840012987',
        city: 'Chennai',
        address: '45, Adyar Main Road, Chennai, Tamil Nadu'
      },
      {
        email: 'kovaigreen@ngo.org',
        orgName: 'Kovai Green Earth Trust',
        registrationNumber: 'NGO-TN-2020-00312',
        contactPerson: 'K. Balasubramanian',
        phone: '9842211445',
        city: 'Coimbatore',
        address: '78, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu'
      },
      {
        email: 'pandian@ngo.org',
        orgName: 'Pandian Social Service Sangam',
        registrationNumber: 'NGO-TN-2019-00561',
        contactPerson: 'M. Senthilvel',
        phone: '9843055667',
        city: 'Madurai',
        address: '12, West Masi Street, Madurai, Tamil Nadu'
      },
      {
        email: 'kaveritrust@ngo.org',
        orgName: 'Kaveri Pasumai Samiti',
        registrationNumber: 'NGO-TN-2021-00982',
        contactPerson: 'R. Soundararajan',
        phone: '9841099881',
        city: 'Tiruchirappalli',
        address: '34, Salai Road, Thillai Nagar, Tiruchirappalli, Tamil Nadu'
      },
      {
        email: 'salemcare@ngo.org',
        orgName: 'Shevaroys Hills Environment Mission',
        registrationNumber: 'NGO-TN-2022-00441',
        contactPerson: 'V. Prakash',
        phone: '9842033221',
        city: 'Salem',
        address: '56, Cherry Road, Hasthampatti, Salem, Tamil Nadu'
      },
      {
        email: 'tamirabarani@ngo.org',
        orgName: 'Tamirabarani Jan Seva Trust',
        registrationNumber: 'NGO-TN-2020-00819',
        contactPerson: 'G. Shanmugam',
        phone: '9843011442',
        city: 'Tirunelveli',
        address: '23, High Ground Road, Palayamkottai, Tirunelveli, Tamil Nadu'
      },
      {
        email: 'velloreseva@ngo.org',
        orgName: 'Palar River Development Society',
        registrationNumber: 'NGO-TN-2021-00623',
        contactPerson: 'E. Jayakumar',
        phone: '9841077889',
        city: 'Vellore',
        address: '89, Gandhi Road, Katpadi, Vellore, Tamil Nadu'
      },
      {
        email: 'bhavanicelfare@ngo.org',
        orgName: 'Bhavani Rural Empowerment Trust',
        registrationNumber: 'NGO-TN-2022-00155',
        contactPerson: 'C. Murugesan',
        phone: '9842088991',
        city: 'Erode',
        address: '67, Perundurai Road, Erode, Tamil Nadu'
      },

      // Pan-India NGOs
      {
        email: 'vidyaseva@ngo.org',
        orgName: 'Vidya Seva Foundation',
        registrationNumber: 'NGO-KA-2021-00892',
        contactPerson: 'Arun Kumar',
        phone: '9845012345',
        city: 'Bengaluru',
        address: '14, 5th Cross, Malleshwaram, Bengaluru, Karnataka'
      },
      {
        email: 'annaseva@ngo.org',
        orgName: 'Rashtra Seva Trust',
        registrationNumber: 'NGO-DL-2019-00431',
        contactPerson: 'Sunita Sharma',
        phone: '9811098765',
        city: 'Delhi',
        address: '88, Barakhamba Road, Connaught Place, New Delhi'
      },
      {
        email: 'sahyadri@ngo.org',
        orgName: 'Sahyadri Nisarga Mitra',
        registrationNumber: 'NGO-MH-2020-00615',
        contactPerson: 'Milind Kulkarni',
        phone: '9820011445',
        city: 'Mumbai',
        address: '22, Dadar West, Mumbai, Maharashtra'
      },
      {
        email: 'bangla@ngo.org',
        orgName: 'Bangla Shanti Mission',
        registrationNumber: 'NGO-WB-2020-00388',
        contactPerson: 'Debashis Banerjee',
        phone: '9830098123',
        city: 'Kolkata',
        address: '12, Sector 2, Salt Lake, Kolkata, West Bengal'
      },
      {
        email: 'sneha@ngo.org',
        orgName: 'Sneha Karunalaya Trust',
        registrationNumber: 'NGO-TS-2022-00918',
        contactPerson: 'Rajesh Varma',
        phone: '9848033221',
        city: 'Hyderabad',
        address: '7, Begumpet Road, Secunderabad, Hyderabad, Telangana'
      },
      {
        email: 'puneseva@ngo.org',
        orgName: 'Godavari Gram Seva Sangham',
        registrationNumber: 'NGO-MH-2022-00812',
        contactPerson: 'Nitin Deshpande',
        phone: '9822019944',
        city: 'Pune',
        address: '18, FC Road, Shivajinagar, Pune, Maharashtra'
      },
      {
        email: 'sabarmati@ngo.org',
        orgName: 'Sabarmati Lok Kalyan Trust',
        registrationNumber: 'NGO-GJ-2021-00512',
        contactPerson: 'Hasmukh Patel',
        phone: '9825012389',
        city: 'Ahmedabad',
        address: '101, Ashram Road, Navrangpura, Ahmedabad, Gujarat'
      },
      {
        email: 'marwar@ngo.org',
        orgName: 'Marwar Samaj Kalyan Sansthan',
        registrationNumber: 'NGO-RJ-2018-00511',
        contactPerson: 'Maheshwari Rathore',
        phone: '9829033445',
        city: 'Jaipur',
        address: '56, MI Road, C-Scheme, Jaipur, Rajasthan'
      },
      {
        email: 'avadhedu@ngo.org',
        orgName: 'Avadh Vidya Seva Sansthan',
        registrationNumber: 'NGO-UP-2020-00441',
        contactPerson: 'Alok Srivastava',
        phone: '9839011223',
        city: 'Lucknow',
        address: '14, Gomti Nagar Phase 2, Lucknow, Uttar Pradesh'
      },
      {
        email: 'shivalik@ngo.org',
        orgName: 'Shivalik Green & Youth Mission',
        registrationNumber: 'NGO-PB-2021-00677',
        contactPerson: 'Harpreet Singh',
        phone: '9814055667',
        city: 'Chandigarh',
        address: '24, Sector 17-C, Chandigarh'
      },
      {
        email: 'keralacare@ngo.org',
        orgName: 'Kerala Samaritans Care Trust',
        registrationNumber: 'NGO-KL-2022-00456',
        contactPerson: 'Mathew Thomas',
        phone: '9846055678',
        city: 'Kochi',
        address: '88, MG Road, Ernakulam, Kochi, Kerala'
      },
      {
        email: 'indoreseva@ngo.org',
        orgName: 'Malwa Jan Seva Samiti',
        registrationNumber: 'NGO-MP-2021-00299',
        contactPerson: 'Deepak Agrawal',
        phone: '9827011234',
        city: 'Indore',
        address: '34, AB Road, Vijay Nagar, Indore, Madhya Pradesh'
      },
      {
        email: 'utkal@ngo.org',
        orgName: 'Utkal Seva Samiti Foundation',
        registrationNumber: 'NGO-OD-2019-00811',
        contactPerson: 'Prabhat Mohanty',
        phone: '9861011882',
        city: 'Bhubaneswar',
        address: '55, Saheed Nagar, Janpath, Bhubaneswar, Odisha'
      },
      {
        email: 'brahmaputra@ngo.org',
        orgName: 'Brahmaputra Community Relief Mission',
        registrationNumber: 'NGO-AS-2022-00199',
        contactPerson: 'Bhaskar Barman',
        phone: '9854033221',
        city: 'Guwahati',
        address: '19, GS Road, Christian Basti, Guwahati, Assam'
      },
      {
        email: 'patnaseva@ngo.org',
        orgName: 'Bihar Vikas & Yuva Chetna Mission',
        registrationNumber: 'NGO-BR-2020-00412',
        contactPerson: 'Sanjay Jha',
        phone: '9835011445',
        city: 'Patna',
        address: '15, Fraser Road, Patna, Bihar'
      },
      {
        email: 'bhopalseva@ngo.org',
        orgName: 'Narmada Valley Welfare Sangathan',
        registrationNumber: 'NGO-MP-2021-00881',
        contactPerson: 'Vivek Chouhan',
        phone: '9826019944',
        city: 'Bhopal',
        address: '42, MP Nagar Zone 1, Bhopal, Madhya Pradesh'
      },
      {
        email: 'vizagcare@ngo.org',
        orgName: 'Coastal Andhra Relief & Care',
        registrationNumber: 'NGO-AP-2022-00713',
        contactPerson: 'K. Srinivasa Rao',
        phone: '9849033441',
        city: 'Visakhapatnam',
        address: '28, Siripuram Junction, Visakhapatnam, Andhra Pradesh'
      },
      {
        email: 'kashiseva@ngo.org',
        orgName: 'Kashi Heritage & Ganga Seva Dal',
        registrationNumber: 'NGO-UP-2019-00954',
        contactPerson: 'Ramesh Pandey',
        phone: '9838022441',
        city: 'Varanasi',
        address: '10, Godowlia Crossing, Varanasi, Uttar Pradesh'
      },
      {
        email: 'majharseva@ngo.org',
        orgName: 'Majha Youth & Langar Seva Trust',
        registrationNumber: 'NGO-PB-2021-00332',
        contactPerson: 'Gurwinder Singh',
        phone: '9815044551',
        city: 'Amritsar',
        address: '77, Lawrence Road, Amritsar, Punjab'
      }
    ];

    const createdNGOs = [];
    for (const ngo of ngosData) {
      const u = new User({ email: ngo.email, password: 'password123', role: 'ngo' });
      await u.save();

      const n = new NGO({
        userId: u._id,
        orgName: ngo.orgName,
        registrationNumber: ngo.registrationNumber,
        contactPerson: ngo.contactPerson,
        phone: ngo.phone,
        city: ngo.city,
        address: ngo.address
      });
      await n.save();
      createdNGOs.push(n);
    }
    console.log(`[SEED] Created ${createdNGOs.length} NGOs across Tamil Nadu and India`);

    // ==============================================================
    // 3. CREATE 37 VOLUNTEERS (TAMIL NADU + PAN-INDIA)
    // ==============================================================

    const volunteersData = [
      // Tamil Nadu Volunteers
      {
        email: 'karthik.raman@gmail.com',
        fullName: 'Karthik Raman',
        city: 'Chennai',
        phone: '9840055667',
        skills: ['Logistics', 'First Aid', 'Clean-up', 'Communication'],
        completed: 8,
        hours: 28,
        points: 136 // Gold
      },
      {
        email: 'senthil.kumar@gmail.com',
        fullName: 'Senthil Kumar',
        city: 'Coimbatore',
        phone: '9842233441',
        skills: ['Planting', 'Clean-up', 'Logistics', 'First Aid'],
        completed: 7,
        hours: 25,
        points: 120 // Gold
      },
      {
        email: 'aravind.swaminathan@gmail.com',
        fullName: 'Aravind Swaminathan',
        city: 'Tiruchirappalli',
        phone: '9841022334',
        skills: ['Teaching', 'English', 'Communication', 'Technology'],
        completed: 6,
        hours: 21,
        points: 102 // Gold
      },
      {
        email: 'murugan.selvam@gmail.com',
        fullName: 'Murugan Selvam',
        city: 'Madurai',
        phone: '9843077881',
        skills: ['Patience', 'Communication', 'First Aid', 'Cooking'],
        completed: 5,
        hours: 17,
        points: 82 // Silver
      },
      {
        email: 'priya.sundaram@gmail.com',
        fullName: 'Priya Sundaram',
        city: 'Chennai',
        phone: '9840099882',
        skills: ['Teaching', 'English', 'Patience', 'Communication'],
        completed: 4,
        hours: 14,
        points: 66 // Silver
      },
      {
        email: 'deepa.natarajan@gmail.com',
        fullName: 'Deepa Natarajan',
        city: 'Coimbatore',
        phone: '9842011449',
        skills: ['Gardening', 'Planting', 'Clean-up'],
        completed: 4,
        hours: 13,
        points: 62 // Silver
      },
      {
        email: 'kavitha.sridharan@gmail.com',
        fullName: 'Kavitha Sridharan',
        city: 'Erode',
        phone: '9842066551',
        skills: ['First Aid', 'Logistics', 'Packaging'],
        completed: 3,
        hours: 11,
        points: 52 // Silver
      },
      {
        email: 'muthu.krishnan@gmail.com',
        fullName: 'Muthu Krishnan',
        city: 'Tirunelveli',
        phone: '9843033229',
        skills: ['Clean-up', 'Planting', 'Driving'],
        completed: 3,
        hours: 10,
        points: 48 // Silver
      },
      {
        email: 'dinesh.chandran@gmail.com',
        fullName: 'Dinesh Chandran',
        city: 'Salem',
        phone: '9842077112',
        skills: ['Cooking', 'Packaging', 'Logistics'],
        completed: 2,
        hours: 7,
        points: 38 // Bronze
      },
      {
        email: 'vigneshwar.raj@gmail.com',
        fullName: 'Vigneshwar Raj',
        city: 'Vellore',
        phone: '9841055443',
        skills: ['Patience', 'Communication', 'Technology'],
        completed: 2,
        hours: 6,
        points: 34 // Bronze
      },
      {
        email: 'meenakshi.s@gmail.com',
        fullName: 'Meenakshi Sundaram',
        city: 'Madurai',
        phone: '9843088992',
        skills: ['Patience', 'First Aid', 'Communication'],
        completed: 2,
        hours: 6,
        points: 32 // Bronze
      },
      {
        email: 'anand.balaji@gmail.com',
        fullName: 'Anand Balaji',
        city: 'Thanjavur',
        phone: '9841066778',
        skills: ['Teaching', 'English', 'Clean-up'],
        completed: 1,
        hours: 4,
        points: 26 // Bronze
      },

      // Pan-India Volunteers
      {
        email: 'rahul.volunteer@gmail.com',
        fullName: 'Rahul Sharma',
        city: 'Bengaluru',
        phone: '9876543210',
        skills: ['Teaching', 'English', 'Communication', 'First Aid'],
        completed: 7,
        hours: 26,
        points: 122 // Gold
      },
      {
        email: 'meera.joshi@gmail.com',
        fullName: 'Meera Joshi',
        city: 'Pune',
        phone: '9822099112',
        skills: ['Clean-up', 'Planting', 'Logistics', 'Driving'],
        completed: 5,
        hours: 19,
        points: 88 // Gold
      },
      {
        email: 'vikram.singh@gmail.com',
        fullName: 'Vikram Singh',
        city: 'Delhi',
        phone: '9811044556',
        skills: ['First Aid', 'Packaging', 'Logistics', 'Carpentry'],
        completed: 5,
        hours: 18,
        points: 84 // Gold
      },
      {
        email: 'ananya.sen@gmail.com',
        fullName: 'Ananya Sen',
        city: 'Kolkata',
        phone: '9830011223',
        skills: ['Teaching', 'Technology', 'English', 'Patience'],
        completed: 4,
        hours: 15,
        points: 70 // Silver
      },
      {
        email: 'amit.deshmukh@gmail.com',
        fullName: 'Amit Deshmukh',
        city: 'Mumbai',
        phone: '9820055441',
        skills: ['Clean-up', 'Planting', 'Gardening', 'Driving'],
        completed: 4,
        hours: 14,
        points: 68 // Silver
      },
      {
        email: 'sneha.rao@gmail.com',
        fullName: 'Sneha Rao',
        city: 'Bengaluru',
        phone: '9845077881',
        skills: ['Technology', 'Teaching', 'Communication'],
        completed: 4,
        hours: 13,
        points: 62 // Silver
      },
      {
        email: 'priya.patel@gmail.com',
        fullName: 'Priya Patel',
        city: 'Ahmedabad',
        phone: '9825099881',
        skills: ['Cooking', 'Packaging', 'Driving', 'Clean-up'],
        completed: 3,
        hours: 11,
        points: 52 // Silver
      },
      {
        email: 'sneha.reddy@gmail.com',
        fullName: 'Sneha Reddy',
        city: 'Hyderabad',
        phone: '9849022334',
        skills: ['Technology', 'Communication', 'Patience', 'Teaching'],
        completed: 3,
        hours: 10,
        points: 50 // Silver
      },
      {
        email: 'abhishek.kumar@gmail.com',
        fullName: 'Abhishek Kumar',
        city: 'Patna',
        phone: '9835044551',
        skills: ['Teaching', 'English', 'Logistics', 'First Aid'],
        completed: 3,
        hours: 10,
        points: 46 // Silver
      },
      {
        email: 'alok.tiwari@gmail.com',
        fullName: 'Alok Tiwari',
        city: 'Lucknow',
        phone: '9839055441',
        skills: ['Teaching', 'English', 'Communication'],
        completed: 2,
        hours: 7,
        points: 44 // Silver
      },
      {
        email: 'rohan.mehta@gmail.com',
        fullName: 'Rohan Mehta',
        city: 'Mumbai',
        phone: '9820088992',
        skills: ['Communication', 'First Aid', 'Patience'],
        completed: 2,
        hours: 8,
        points: 40 // Bronze
      },
      {
        email: 'tanmay.k@gmail.com',
        fullName: 'Tanmay Kulkarni',
        city: 'Pune',
        phone: '9822066551',
        skills: ['Clean-up', 'Logistics', 'Driving'],
        completed: 2,
        hours: 7,
        points: 38 // Bronze
      },
      {
        email: 'sai.teja@gmail.com',
        fullName: 'Sai Teja',
        city: 'Hyderabad',
        phone: '9849066772',
        skills: ['First Aid', 'Logistics', 'Clean-up'],
        completed: 2,
        hours: 6,
        points: 34 // Bronze
      },
      {
        email: 'ravi.teja@gmail.com',
        fullName: 'Ravi Teja',
        city: 'Visakhapatnam',
        phone: '9849088112',
        skills: ['Logistics', 'First Aid', 'Driving'],
        completed: 2,
        hours: 6,
        points: 32 // Bronze
      },
      {
        email: 'pooja.malhotra@gmail.com',
        fullName: 'Pooja Malhotra',
        city: 'Delhi',
        phone: '9811088771',
        skills: ['Cooking', 'Packaging', 'Communication'],
        completed: 1,
        hours: 5,
        points: 30 // Bronze
      },
      {
        email: 'soumya.m@gmail.com',
        fullName: 'Soumya Mukherjee',
        city: 'Kolkata',
        phone: '9830055441',
        skills: ['Teaching', 'Communication', 'Patience'],
        completed: 1,
        hours: 4,
        points: 28 // Bronze
      },
      {
        email: 'rajesh.tanwar@gmail.com',
        fullName: 'Rajesh Tanwar',
        city: 'Jaipur',
        phone: '9829011998',
        skills: ['Communication', 'Clean-up', 'Driving'],
        completed: 1,
        hours: 4,
        points: 28 // Bronze
      },
      {
        email: 'simran.kaur@gmail.com',
        fullName: 'Simran Kaur',
        city: 'Chandigarh',
        phone: '9814022331',
        skills: ['Clean-up', 'Planting', 'Gardening'],
        completed: 1,
        hours: 4,
        points: 28 // Bronze
      },
      {
        email: 'nitin.saxena@gmail.com',
        fullName: 'Nitin Saxena',
        city: 'Bhopal',
        phone: '9826077881',
        skills: ['Patience', 'Communication', 'First Aid'],
        completed: 1,
        hours: 4,
        points: 28 // Bronze
      },
      {
        email: 'jasleen.gill@gmail.com',
        fullName: 'Jasleen Gill',
        city: 'Amritsar',
        phone: '9815022334',
        skills: ['Cooking', 'Packaging', 'Logistics'],
        completed: 1,
        hours: 4,
        points: 28 // Bronze
      },
      {
        email: 'divya.agrawal@gmail.com',
        fullName: 'Divya Agrawal',
        city: 'Indore',
        phone: '9827055443',
        skills: ['Packaging', 'Cooking', 'Communication'],
        completed: 1,
        hours: 3,
        points: 26 // Bronze
      },
      {
        email: 'sourav.patnaik@gmail.com',
        fullName: 'Sourav Patnaik',
        city: 'Bhubaneswar',
        phone: '9861044551',
        skills: ['First Aid', 'Packaging', 'Logistics'],
        completed: 1,
        hours: 3,
        points: 26 // Bronze
      },
      {
        email: 'jatin.baruah@gmail.com',
        fullName: 'Jatin Baruah',
        city: 'Guwahati',
        phone: '9854011992',
        skills: ['Logistics', 'First Aid', 'Clean-up'],
        completed: 1,
        hours: 3,
        points: 26 // Bronze
      },
      {
        email: 'kavitha.nair@gmail.com',
        fullName: 'Kavitha Nair',
        city: 'Kochi',
        phone: '9846011442',
        skills: ['Patience', 'Communication', 'First Aid'],
        completed: 1,
        hours: 3,
        points: 26 // Bronze
      },
      {
        email: 'aman.mishra@gmail.com',
        fullName: 'Aman Mishra',
        city: 'Varanasi',
        phone: '9838055661',
        skills: ['Clean-up', 'Communication', 'Logistics'],
        completed: 1,
        hours: 3,
        points: 24 // Bronze
      }
    ];

    const createdVolunteers = [];
    for (const v of volunteersData) {
      const u = new User({ email: v.email, password: 'password123', role: 'volunteer' });
      await u.save();

      const vol = new Volunteer({
        userId: u._id,
        fullName: v.fullName,
        phone: v.phone,
        city: v.city,
        skills: v.skills,
        completedTasksCount: v.completed,
        totalHours: v.hours,
        rankingPoints: v.points
      });
      await vol.save();
      createdVolunteers.push(vol);
    }
    console.log(`[SEED] Created ${createdVolunteers.length} volunteers across Tamil Nadu and India`);

    // Helper to find NGO by email
    const getNGO = (email) => createdNGOs.find((n) => n.userId.toString() === ngosData.find((d) => d.email === email)._id || createdNGOs[ngosData.findIndex((d) => d.email === email)]._id);

    // Map NGOs by city for clean task association
    const ngoMap = {};
    for (let i = 0; i < ngosData.length; i++) {
      ngoMap[ngosData[i].city] = createdNGOs[i]._id;
    }

    // ==============================================================
    // 4. CREATE 42 COMMUNITY TASKS (ALL 6 MANDATORY CATEGORIES)
    // ==============================================================

    const tasks = [
      // ------------------------------------------------------------------
      // CATEGORY 1: EDUCATION (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Spoken English & Basic Math Tutoring for Children',
        description: 'Conduct interactive learning sessions for 30 underprivileged primary students to strengthen foundational literacy and numeracy.',
        category: 'Education',
        requiredSkills: ['Teaching', 'English', 'Communication'],
        location: 'Govt Model Primary School, Malleshwaram',
        city: 'Bengaluru',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Bengaluru']
      },
      {
        title: 'Remedial Evening Coaching for Coastal Children',
        description: 'Assist primary school children of local fisherman families with daily homework, Tamil, and arithmetic lessons.',
        category: 'Education',
        requiredSkills: ['Teaching', 'English', 'Patience'],
        location: 'Kavalar Community Center, Besant Nagar',
        city: 'Chennai',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Chennai']
      },
      {
        title: 'Digital Literacy & Computer Basics for Slum Youth',
        description: 'Teach keyboarding, email drafting, and online government portal navigation to college-bound youth from informal settlements.',
        category: 'Education',
        requiredSkills: ['Technology', 'Teaching', 'Patience'],
        location: 'Community Resource Center, Begumpet',
        city: 'Hyderabad',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Hyderabad']
      },
      {
        title: 'Primary School Science Experiments & Interactive STEM Lab',
        description: 'Demonstrate hands-on physics and chemistry experiments for municipal middle school students to spark curiosity in science.',
        category: 'Education',
        requiredSkills: ['Teaching', 'Communication', 'Patience'],
        location: 'Salt Lake Municipal School, Sector 2',
        city: 'Kolkata',
        dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Kolkata']
      },
      {
        title: 'Foundational English & Math Workshop for Textile Mill Children',
        description: 'Mentor children of textile weavers in conversational English, mathematical tables, and reading fluency.',
        category: 'Education',
        requiredSkills: ['Teaching', 'English', 'Communication'],
        location: 'Corporation Middle School, Peelamedu',
        city: 'Coimbatore',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Coimbatore']
      },
      {
        title: 'Foundational Hindi & English Reading Circle for Slum Kids',
        description: 'Facilitate storybook reading circles and basic vocabulary games for first-generation school learners.',
        category: 'Education',
        requiredSkills: ['Teaching', 'Communication', 'Patience'],
        location: 'Gomti Nagar Community Hall',
        city: 'Lucknow',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 0,
        status: 'Open',
        createdBy: ngoMap['Lucknow']
      },
      {
        title: 'Rural Youth Career Guidance & Spoken English Mentorship',
        description: 'Deliver career planning sessions, resume writing workshops, and basic spoken English to high school graduates.',
        category: 'Education',
        requiredSkills: ['Teaching', 'Communication', 'English'],
        location: 'Fraser Road Youth Hall',
        city: 'Patna',
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Patna']
      },

      // ------------------------------------------------------------------
      // CATEGORY 2: FOOD DISTRIBUTION (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Weekend Surplus Food Packaging & Slum Distribution',
        description: 'Package surplus banquet meals and safely distribute nutritious food packets to 200 migrant worker families.',
        category: 'Food distribution',
        requiredSkills: ['Packaging', 'Logistics', 'Driving'],
        location: 'Rashtra Seva Community Kitchen, Barakhamba Road',
        city: 'Delhi',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Delhi']
      },
      {
        title: 'Sunday Morning Nutritious Breakfast Drive for Pavement Dwellers',
        description: 'Cook, assemble, and distribute 350 warm idli-sambar and fruit boxes to destitute individuals near bus terminals.',
        category: 'Food distribution',
        requiredSkills: ['Cooking', 'Packaging', 'Clean-up'],
        location: 'Central Bus Stand Outer Concourse',
        city: 'Tiruchirappalli',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Tiruchirappalli']
      },
      {
        title: 'Nutritious Khichdi Meal Distribution at Slum Clusters',
        description: 'Assemble and transport warm vegetable khichdi pots to provide wholesome mid-day meals to slum children.',
        category: 'Food distribution',
        requiredSkills: ['Packaging', 'Logistics', 'Cooking'],
        location: 'Dharavi Slum Transition Settlement',
        city: 'Mumbai',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Mumbai']
      },
      {
        title: 'Free Food Ration Packing for Destitute Widows & Daily Wagers',
        description: 'Sort and bag dry grocery essentials (rice, dal, cooking oil, spices) into monthly relief hampers for 120 families.',
        category: 'Food distribution',
        requiredSkills: ['Packaging', 'Logistics', 'Clean-up'],
        location: 'Shevaroys Trust Hall, Cherry Road',
        city: 'Salem',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Salem']
      },
      {
        title: 'Warm Meal Assembly & Delivery for Daily Wage Laborers',
        description: 'Pack and distribute 300 hot thali lunch boxes to daily wage construction workers and sanitation laborers.',
        category: 'Food distribution',
        requiredSkills: ['Cooking', 'Packaging', 'Driving'],
        location: 'Sabarmati Relief Center, Ashram Road',
        city: 'Ahmedabad',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Ahmedabad']
      },
      {
        title: 'Midday Community Meal Langar Preparation & Service',
        description: 'Assist in cutting vegetables, kneading flour, and serving community meals to 500 pilgrims and homeless visitors.',
        category: 'Food distribution',
        requiredSkills: ['Cooking', 'Packaging', 'Logistics'],
        location: 'Majha Community Kitchen, Lawrence Road',
        city: 'Amritsar',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Amritsar']
      },
      {
        title: 'Night Street Feeder Drive for Homeless Families',
        description: 'Conduct an organized late-evening mobile food van drive supplying ready-to-eat hot meal packets to homeless families.',
        category: 'Food distribution',
        requiredSkills: ['Driving', 'Packaging', 'Communication'],
        location: 'Secunderabad Railway Station Environs',
        city: 'Hyderabad',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 0,
        status: 'Open',
        createdBy: ngoMap['Hyderabad']
      },

      // ------------------------------------------------------------------
      // CATEGORY 3: ENVIRONMENT (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Coastal Cleanup & Marine Microplastic Removal Drive',
        description: 'Collect, document, and safely segregate non-biodegradable debris and ghost nets from sandy nesting zones.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Logistics', 'First Aid'],
        location: 'Elliot Beach & Besant Nagar Seashore',
        city: 'Chennai',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 12,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Chennai']
      },
      {
        title: 'Noyyal Riverbank Desilting & Miyawaki Afforestation Drive',
        description: 'Plant 400 native saplings along the Noyyal riverbank and remove discarded plastic bottles from canal embankments.',
        category: 'Environment',
        requiredSkills: ['Planting', 'Clean-up', 'Gardening'],
        location: 'Noyyal River Embankment, Singanallur',
        city: 'Coimbatore',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 10,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Coimbatore']
      },
      {
        title: 'Mangrove Restoration & Shoreline Plastic Cleanup',
        description: 'Clear plastic waste trapped in coastal mangrove roots and plant 250 mangrove saplings to protect creek shorelines.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Planting', 'Gardening'],
        location: 'Mahim Creek Mangrove Belt, Bandra',
        city: 'Mumbai',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 10,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Mumbai']
      },
      {
        title: 'Tamirabarani River Ghat Cleaning & Seed Ball Dispersion',
        description: 'Clean sacred bathing ghats along the Tamirabarani river and disperse 600 seed balls along deforested river banks.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Planting', 'Logistics'],
        location: 'Kurukkuthurai Murugan Temple Ghat',
        city: 'Tirunelveli',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Tirunelveli']
      },
      {
        title: 'Mula-Mutha Riverbank Cleaning & Native Sapling Plantation',
        description: 'Remove solid plastic debris, clear weeds, and plant 300 drought-tolerant native saplings along the riverbank.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Planting', 'Logistics'],
        location: 'Bund Garden Riverside Promenade',
        city: 'Pune',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Pune']
      },
      {
        title: 'Sukhna Lake Eco-Zone Plastic Removal & Awareness Drive',
        description: 'Collect non-biodegradable bottles and chip wrappers along forest walking trails and advise morning joggers on zero-litter policies.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Communication', 'Planting'],
        location: 'Sukhna Lake Nature Trail, Sector 1',
        city: 'Chandigarh',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Chandigarh']
      },
      {
        title: 'Ganga Ghat Cleanliness Drive & Plastic Interception',
        description: 'Deploy floating waste nets and manually clean plastic offerings and floral debris along public riverside ghats.',
        category: 'Environment',
        requiredSkills: ['Clean-up', 'Logistics', 'First Aid'],
        location: 'Assi Ghat to Dashashwamedh Ghat Stretch',
        city: 'Varanasi',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Varanasi']
      },

      // ------------------------------------------------------------------
      // CATEGORY 4: ELDER SUPPORT (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Senior Citizen Digital Literacy & Smartphone Assistance Camp',
        description: 'Provide gentle one-on-one assistance to 40 senior residents on UPI digital payments, video calls, and medicine ordering.',
        category: 'Elder support',
        requiredSkills: ['Technology', 'Patience', 'Communication'],
        location: 'Vridhashram Senior Living Center, Rohini',
        city: 'Delhi',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Delhi']
      },
      {
        title: 'Geriatric Recreation, Newspaper Reading & Companionship Circle',
        description: 'Spend an uplifting evening with 35 senior residents in an old age home reading Tamil classics and playing memory games.',
        category: 'Elder support',
        requiredSkills: ['Patience', 'Communication', 'First Aid'],
        location: 'Anbu Karangal Senior Home, Tallakulam',
        city: 'Madurai',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Madurai']
      },
      {
        title: 'Storytelling, Board Games & Musical Evening with Elderly Residents',
        description: 'Engage senior citizens with interactive carrom matches, Rabindra Sangeet sing-alongs, and empathetic listening sessions.',
        category: 'Elder support',
        requiredSkills: ['Patience', 'Communication', 'First Aid'],
        location: 'Shanti Old Age Home, Salt Lake',
        city: 'Kolkata',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 0,
        status: 'Open',
        createdBy: ngoMap['Kolkata']
      },
      {
        title: 'Health Vital Checkup Assistance & Mobility Support for Seniors',
        description: 'Assist visiting physicians with pulse oximeter readings, blood pressure logs, and escorting infirm elders to exam rooms.',
        category: 'Elder support',
        requiredSkills: ['First Aid', 'Patience', 'Communication'],
        location: 'Karunai Illam Old Age Home, Katpadi',
        city: 'Vellore',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Vellore']
      },
      {
        title: 'Palliative Care Recreational Day & Memory Games for Elders',
        description: 'Conduct guided memory recall exercises, simple chair yoga sessions, and listen to life stories of senior hospice inmates.',
        category: 'Elder support',
        requiredSkills: ['Patience', 'Communication', 'First Aid'],
        location: 'St. Joseph Palliative Care Hospice, Ernakulam',
        city: 'Kochi',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Kochi']
      },
      {
        title: 'Assisted Grocery Shopping & Pharmacy Walks for Bedridden Seniors',
        description: 'Support independent elderly couples with home delivery of monthly prescription medicines and bank paperwork.',
        category: 'Elder support',
        requiredSkills: ['Patience', 'Communication', 'Driving'],
        location: 'MP Nagar Senior Citizens Guild',
        city: 'Bhopal',
        dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 4,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Bhopal']
      },
      {
        title: 'Community Eye Checkup & Spectacle Distribution Camp for Seniors',
        description: 'Guide senior citizens through visual acuity chart screening, register OPD slips, and dispense reading spectacles.',
        category: 'Elder support',
        requiredSkills: ['Communication', 'Patience', 'Logistics'],
        location: 'Utkal Community Welfare Hall, Saheed Nagar',
        city: 'Bhubaneswar',
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Bhubaneswar']
      },

      // ------------------------------------------------------------------
      // CATEGORY 5: DISASTER SUPPORT (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Emergency Flood Relief Kit Assembly & Logistic Packing',
        description: 'Sort and pack emergency water purification tablets, high-energy dry rations, and waterproof tarpaulins for low-lying coastal colonies.',
        category: 'Disaster support',
        requiredSkills: ['Packaging', 'Logistics', 'First Aid'],
        location: 'Disaster Coordination Depot, Velachery',
        city: 'Chennai',
        dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        hours: 5,
        volunteersRequired: 8,
        volunteersAssigned: 2,
        status: 'Open',
        createdBy: ngoMap['Chennai']
      },
      {
        title: 'Urban Flood First Aid & Emergency Dry Ration Packaging',
        description: 'Sort, inspect, and crate 400 family dry ration packages, mosquito nets, and first-aid kits for flood-hit settlements.',
        category: 'Disaster support',
        requiredSkills: ['Logistics', 'First Aid', 'Packaging'],
        location: 'Relief Depot, Yamuna Bazar Enclave',
        city: 'Delhi',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Delhi']
      },
      {
        title: 'Cyclone Shelter Readiness & Emergency First Aid Station Setup',
        description: 'Equip public coastal storm shelters with solar lanterns, emergency medication, and water canister distribution desks.',
        category: 'Disaster support',
        requiredSkills: ['First Aid', 'Logistics', 'Communication'],
        location: 'Siripuram Emergency Evacuation Center',
        city: 'Visakhapatnam',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Visakhapatnam']
      },
      {
        title: 'Brahmaputra Flash Flood Medical Kit Assembly & Water Purification',
        description: 'Pack 500 family water purification kits, chlorine drops, and zinc tablets for displaced river-island families.',
        category: 'Disaster support',
        requiredSkills: ['First Aid', 'Packaging', 'Logistics'],
        location: 'Brahmaputra Disaster Center, Christian Basti',
        city: 'Guwahati',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 5,
        volunteersRequired: 10,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Guwahati']
      },
      {
        title: 'Monsoon Waterlogging Relief & Sandbag Embankment Reinforcement',
        description: 'Fill and deploy heavy sandbags along overflowing irrigation canals to protect agrarian settlements from flash floods.',
        category: 'Disaster support',
        requiredSkills: ['Logistics', 'Clean-up', 'First Aid'],
        location: 'Bhavani River Sluice Gate Depot',
        city: 'Erode',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 8,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Erode']
      },
      {
        title: 'Winter Extreme Cold Blanket & Thermal Wear Distribution',
        description: 'Distribute 300 heavy woolen blankets and sweaters to nighttime pavement occupants and nomadic rickshaw pullers.',
        category: 'Disaster support',
        requiredSkills: ['Logistics', 'Driving', 'Communication'],
        location: 'Jaipur Railway Station & Night Shelter Environs',
        city: 'Jaipur',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Jaipur']
      },
      {
        title: 'Riverbank Inundation Family Hygiene Kit Packaging Drive',
        description: 'Package antiseptic soaps, sanitary napkins, ORS sachets, and bandages into sealed dry packs for flood-prone rural blocks.',
        category: 'Disaster support',
        requiredSkills: ['Packaging', 'First Aid', 'Logistics'],
        location: 'Red Cross Relief Warehouse, Fraser Road',
        city: 'Patna',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Patna']
      },

      // ------------------------------------------------------------------
      // CATEGORY 6: COMMUNITY SERVICE (7 Tasks)
      // ------------------------------------------------------------------
      {
        title: 'Public Library Book Cataloging & Blind Student Audio Recording',
        description: 'Digitally index 500 donated regional textbooks and record crisp audiobook chapters for visually impaired students.',
        category: 'Community service',
        requiredSkills: ['Communication', 'Technology', 'English'],
        location: 'Central Public Library, Cubbon Park',
        city: 'Bengaluru',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Bengaluru']
      },
      {
        title: 'Government Hospital Patient Navigation & Wheelchair Escort',
        description: 'Assist elderly and disabled outpatients with hospital navigation, wheelchair guidance, and registration counter procedures.',
        category: 'Community service',
        requiredSkills: ['Patience', 'Communication', 'First Aid'],
        location: 'KEM Hospital Outpatient Wing, Parel',
        city: 'Mumbai',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Mumbai']
      },
      {
        title: 'Rockfort Heritage Temple Cleanliness & Pilgrim Guidance Drive',
        description: 'Assist elderly devotees ascending temple stone steps, distribute drinking water, and guide pilgrims on plastic-free temple grounds.',
        category: 'Community service',
        requiredSkills: ['Communication', 'Clean-up', 'Patience'],
        location: 'Rockfort Uchchi Pillayar Temple Steps',
        city: 'Tiruchirappalli',
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Tiruchirappalli']
      },
      {
        title: 'Mega Blood Donation Camp Donor Registration & Refreshment Management',
        description: 'Manage voluntary donor registration, pre-donation medical history slips, and coordinate donor refreshment tables.',
        category: 'Community service',
        requiredSkills: ['Communication', 'Logistics', 'First Aid'],
        location: 'Shivajinagar Community Hall, FC Road',
        city: 'Pune',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 6,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Pune']
      },
      {
        title: 'Heritage Monument Cleanliness & Public Heritage Awareness',
        description: 'Conduct a public cleanliness campaign around historic monuments and guide visitors on waste segregation practices.',
        category: 'Community service',
        requiredSkills: ['Communication', 'Clean-up', 'Public Speaking'],
        location: 'City Palace & Hawa Mahal Environs',
        city: 'Jaipur',
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 6,
        volunteersAssigned: 0,
        status: 'Open',
        createdBy: ngoMap['Jaipur']
      },
      {
        title: 'Old City Riverfront Promenade Cleanliness & Plastic Segregation',
        description: 'Conduct awareness on clean heritage walkways and clean plastic wraps along public pilgrimage and river ghats.',
        category: 'Community service',
        requiredSkills: ['Clean-up', 'Communication', 'Logistics'],
        location: 'Gomti Riverfront Promenade',
        city: 'Lucknow',
        dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        hours: 3,
        volunteersRequired: 5,
        volunteersAssigned: 0,
        status: 'Open',
        createdBy: ngoMap['Lucknow']
      },
      {
        title: 'Government Headquarter Hospital Blood Camp Support & Triage',
        description: 'Assist medical officers with queue management, voluntary blood donor hydration, and recovery monitoring.',
        category: 'Community service',
        requiredSkills: ['Communication', 'Logistics', 'First Aid'],
        location: 'District Headquarter Hospital, Hasthampatti',
        city: 'Salem',
        dateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        hours: 4,
        volunteersRequired: 5,
        volunteersAssigned: 1,
        status: 'Open',
        createdBy: ngoMap['Salem']
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`[SEED] Created ${createdTasks.length} tasks across Tamil Nadu and Indian cities`);

    // ==============================================================
    // 5. SAMPLE APPLICATIONS AND COMPLETED CERTIFICATES
    // ==============================================================

    // Helper map for tasks by title
    const taskMap = {};
    createdTasks.forEach((t) => {
      taskMap[t.title] = t;
    });

    // Helper map for volunteers by email
    const volMap = {};
    createdVolunteers.forEach((v) => {
      volMap[v.userId.toString()] = v;
    });
    const getVol = (email) => {
      const idx = volunteersData.findIndex((d) => d.email === email);
      return createdVolunteers[idx];
    };

    // --- CERTIFICATE 1: Karthik Raman (Chennai Coastal Cleanup) ---
    const tCert1 = taskMap['Coastal Cleanup & Marine Microplastic Removal Drive'];
    const vCert1 = getVol('karthik.raman@gmail.com');
    const app1 = new Application({
      taskId: tCert1._id,
      volunteerId: vCert1._id,
      status: 'Completed',
      notes: 'Led beach cleanup crew and segregated microplastics.',
      appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    await app1.save();

    const cert1 = new Certificate({
      certificateId: 'CHH-CERT-IND-CHN-1001',
      volunteerId: vCert1._id,
      taskId: tCert1._id,
      ngoId: tCert1.createdBy,
      hoursCompleted: 4,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    await cert1.save();

    // --- CERTIFICATE 2: Senthil Kumar (Coimbatore Noyyal Riverbank) ---
    const tCert2 = taskMap['Noyyal Riverbank Desilting & Miyawaki Afforestation Drive'];
    const vCert2 = getVol('senthil.kumar@gmail.com');
    const app2 = new Application({
      taskId: tCert2._id,
      volunteerId: vCert2._id,
      status: 'Completed',
      notes: 'Planted native saplings along canal bank.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await app2.save();

    const cert2 = new Certificate({
      certificateId: 'CHH-CERT-IND-CBE-2001',
      volunteerId: vCert2._id,
      taskId: tCert2._id,
      ngoId: tCert2.createdBy,
      hoursCompleted: 4,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await cert2.save();

    // --- CERTIFICATE 3: Rahul Sharma (Bengaluru Education) ---
    const tCert3 = taskMap['Spoken English & Basic Math Tutoring for Children'];
    const vCert3 = getVol('rahul.volunteer@gmail.com');
    const app3 = new Application({
      taskId: tCert3._id,
      volunteerId: vCert3._id,
      status: 'Completed',
      notes: 'Handled spoken English and math sessions for primary students.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await app3.save();

    const cert3 = new Certificate({
      certificateId: 'CHH-CERT-IND-BLR-3001',
      volunteerId: vCert3._id,
      taskId: tCert3._id,
      ngoId: tCert3.createdBy,
      hoursCompleted: 3,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await cert3.save();

    // --- CERTIFICATE 4: Aravind Swaminathan (Trichy Breakfast Drive) ---
    const tCert4 = taskMap['Sunday Morning Nutritious Breakfast Drive for Pavement Dwellers'];
    const vCert4 = getVol('aravind.swaminathan@gmail.com');
    const app4 = new Application({
      taskId: tCert4._id,
      volunteerId: vCert4._id,
      status: 'Completed',
      notes: 'Coordinated packaging and hot meal delivery.',
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await app4.save();

    const cert4 = new Certificate({
      certificateId: 'CHH-CERT-IND-TRY-4001',
      volunteerId: vCert4._id,
      taskId: tCert4._id,
      ngoId: tCert4.createdBy,
      hoursCompleted: 4,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await cert4.save();

    // --- CERTIFICATE 5: Meera Joshi (Pune River Cleaning) ---
    const tCert5 = taskMap['Mula-Mutha Riverbank Cleaning & Native Sapling Plantation'];
    const vCert5 = getVol('meera.joshi@gmail.com');
    const app5 = new Application({
      taskId: tCert5._id,
      volunteerId: vCert5._id,
      status: 'Completed',
      notes: 'Riverbank clearing and sapling drive volunteer coordinator.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await app5.save();

    const cert5 = new Certificate({
      certificateId: 'CHH-CERT-IND-PUN-5001',
      volunteerId: vCert5._id,
      taskId: tCert5._id,
      ngoId: tCert5.createdBy,
      hoursCompleted: 4,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await cert5.save();

    // --- CERTIFICATE 6: Murugan Selvam (Madurai Elder Support) ---
    const tCert6 = taskMap['Geriatric Recreation, Newspaper Reading & Companionship Circle'];
    const vCert6 = getVol('murugan.selvam@gmail.com');
    const app6 = new Application({
      taskId: tCert6._id,
      volunteerId: vCert6._id,
      status: 'Completed',
      notes: 'Organized reading sessions and memory activities for seniors.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await app6.save();

    const cert6 = new Certificate({
      certificateId: 'CHH-CERT-IND-MDU-6001',
      volunteerId: vCert6._id,
      taskId: tCert6._id,
      ngoId: tCert6.createdBy,
      hoursCompleted: 3,
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    await cert6.save();

    // Additional completed applications to mathematically match completedTasksCount and totalHours
    const additionalCompletedApplications = [
      // Karthik Raman (7 more tasks + 1 cert1 task = 8 completed tasks, exactly 28 hours)
      {
        task: 'Remedial Evening Coaching for Coastal Children',
        vol: 'karthik.raman@gmail.com',
        notes: 'Provided evening coaching in arithmetic and Tamil for coastal school kids.',
        daysAgoApplied: 14,
        daysAgoCompleted: 12
      },
      {
        task: 'Weekend Surplus Food Packaging & Slum Distribution',
        vol: 'karthik.raman@gmail.com',
        notes: 'Supported surplus food packaging and distributed dinner boxes to 150 families.',
        daysAgoApplied: 12,
        daysAgoCompleted: 10
      },
      {
        task: 'Senior Citizen Digital Literacy & Smartphone Assistance Camp',
        vol: 'karthik.raman@gmail.com',
        notes: 'Trained elderly residents on smartphone use, UPI payments, and emergency calling.',
        daysAgoApplied: 10,
        daysAgoCompleted: 8
      },
      {
        task: 'Monsoon Waterlogging Relief & Sandbag Embankment Reinforcement',
        vol: 'karthik.raman@gmail.com',
        notes: 'Assisted in sandbag barrier construction to prevent street flooding in low-lying zones.',
        daysAgoApplied: 9,
        daysAgoCompleted: 7
      },
      {
        task: 'Public Library Book Cataloging & Blind Student Audio Recording',
        vol: 'karthik.raman@gmail.com',
        notes: 'Narrated audio textbooks and indexed academic reference materials for visually impaired students.',
        daysAgoApplied: 8,
        daysAgoCompleted: 5
      },
      {
        task: 'Free Food Ration Packing for Destitute Widows & Daily Wagers',
        vol: 'karthik.raman@gmail.com',
        notes: 'Helped package dry ration kits of grains, lentils, and cooking oil for vulnerable families.',
        daysAgoApplied: 6,
        daysAgoCompleted: 4
      },
      {
        task: 'Geriatric Recreation, Newspaper Reading & Companionship Circle',
        vol: 'karthik.raman@gmail.com',
        notes: 'Facilitated morning news discussions, memory games, and music circle for senior residents.',
        daysAgoApplied: 5,
        daysAgoCompleted: 3
      },

      // Rahul Sharma (6 more tasks + 1 cert3 task = 7 completed tasks, exactly 26 hours)
      {
        task: 'Weekend Surplus Food Packaging & Slum Distribution',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Packaged dinner parcels for migrant laborers and homeless individuals.',
        daysAgoApplied: 12,
        daysAgoCompleted: 10
      },
      {
        task: 'Urban Flood First Aid & Emergency Dry Ration Packaging',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Managed relief dry ration distribution desks and assembled trauma hygiene packets.',
        daysAgoApplied: 11,
        daysAgoCompleted: 9
      },
      {
        task: 'Public Library Book Cataloging & Blind Student Audio Recording',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Cataloged reference titles and recorded study notes for college students.',
        daysAgoApplied: 9,
        daysAgoCompleted: 7
      },
      {
        task: 'Mega Blood Donation Camp Donor Registration & Refreshment Management',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Supervised voluntary donor check-ins and recovery hydration counters.',
        daysAgoApplied: 7,
        daysAgoCompleted: 5
      },
      {
        task: 'Health Vital Checkup Assistance & Mobility Support for Seniors',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Assisted geriatric medical triage, record keeping, and blood pressure tests.',
        daysAgoApplied: 6,
        daysAgoCompleted: 4
      },
      {
        task: 'Primary School Science Experiments & Interactive STEM Lab',
        vol: 'rahul.volunteer@gmail.com',
        notes: 'Led practical science demonstration experiments to promote scientific curiosity.',
        daysAgoApplied: 4,
        daysAgoCompleted: 2
      },

      // Senthil Kumar (6 more tasks + 1 cert2 task = 7 completed tasks, exactly 25 hours)
      {
        task: 'Sunday Morning Nutritious Breakfast Drive for Pavement Dwellers',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Distributed fresh breakfast boxes to pavement dwellers and transit commuters.',
        daysAgoApplied: 13,
        daysAgoCompleted: 11
      },
      {
        task: 'Rockfort Heritage Temple Cleanliness & Pilgrim Guidance Drive',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Guided elderly pilgrims and coordinated heritage walkway waste clearing.',
        daysAgoApplied: 11,
        daysAgoCompleted: 9
      },
      {
        task: 'Monsoon Waterlogging Relief & Sandbag Embankment Reinforcement',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Placed sandbags along canal flood walls to safeguard residential streets.',
        daysAgoApplied: 9,
        daysAgoCompleted: 7
      },
      {
        task: 'Foundational English & Math Workshop for Textile Mill Children',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Tutored children of textile weavers in basic mathematics and spoken English.',
        daysAgoApplied: 6,
        daysAgoCompleted: 4
      },
      {
        task: 'Tamirabarani River Ghat Cleaning & Seed Ball Dispersion',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Cleared riverside ghats and dispersed indigenous tree seed balls.',
        daysAgoApplied: 4,
        daysAgoCompleted: 2
      },
      {
        task: 'Free Food Ration Packing for Destitute Widows & Daily Wagers',
        vol: 'senthil.kumar@gmail.com',
        notes: 'Sorted grains and oil provisions into monthly support parcels.',
        daysAgoApplied: 3,
        daysAgoCompleted: 1
      }
    ];

    for (const item of additionalCompletedApplications) {
      const taskDoc = taskMap[item.task];
      const volDoc = getVol(item.vol);
      if (taskDoc && volDoc) {
        const app = new Application({
          taskId: taskDoc._id,
          volunteerId: volDoc._id,
          status: 'Completed',
          notes: item.notes,
          appliedAt: new Date(Date.now() - item.daysAgoApplied * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - item.daysAgoCompleted * 24 * 60 * 60 * 1000)
        });
        await app.save();
      }
    }

    // Active Field Assignments (Assigned status) across Indian and Tamil Nadu cities
    const activeAssignments = [
      { task: 'Remedial Evening Coaching for Coastal Children', vol: 'priya.sundaram@gmail.com' },
      { task: 'Foundational English & Math Workshop for Textile Mill Children', vol: 'deepa.natarajan@gmail.com' },
      { task: 'Digital Literacy & Computer Basics for Slum Youth', vol: 'sneha.reddy@gmail.com' },
      { task: 'Primary School Science Experiments & Interactive STEM Lab', vol: 'ananya.sen@gmail.com' },
      { task: 'Rural Youth Career Guidance & Spoken English Mentorship', vol: 'abhishek.kumar@gmail.com' },
      { task: 'Weekend Surplus Food Packaging & Slum Distribution', vol: 'vikram.singh@gmail.com' },
      { task: 'Nutritious Khichdi Meal Distribution at Slum Clusters', vol: 'amit.deshmukh@gmail.com' },
      { task: 'Free Food Ration Packing for Destitute Widows & Daily Wagers', vol: 'dinesh.chandran@gmail.com' },
      { task: 'Warm Meal Assembly & Delivery for Daily Wage Laborers', vol: 'priya.patel@gmail.com' },
      { task: 'Midday Community Meal Langar Preparation & Service', vol: 'jasleen.gill@gmail.com' },
      { task: 'Tamirabarani River Ghat Cleaning & Seed Ball Dispersion', vol: 'muthu.krishnan@gmail.com' },
      { task: 'Mangrove Restoration & Shoreline Plastic Cleanup', vol: 'rohan.mehta@gmail.com' },
      { task: 'Sukhna Lake Eco-Zone Plastic Removal & Awareness Drive', vol: 'simran.kaur@gmail.com' },
      { task: 'Ganga Ghat Cleanliness Drive & Plastic Interception', vol: 'aman.mishra@gmail.com' },
      { task: 'Senior Citizen Digital Literacy & Smartphone Assistance Camp', vol: 'pooja.malhotra@gmail.com' },
      { task: 'Geriatric Recreation, Newspaper Reading & Companionship Circle', vol: 'meenakshi.s@gmail.com' },
      { task: 'Health Vital Checkup Assistance & Mobility Support for Seniors', vol: 'vigneshwar.raj@gmail.com' },
      { task: 'Palliative Care Recreational Day & Memory Games for Elders', vol: 'kavitha.nair@gmail.com' },
      { task: 'Assisted Grocery Shopping & Pharmacy Walks for Bedridden Seniors', vol: 'nitin.saxena@gmail.com' },
      { task: 'Community Eye Checkup & Spectacle Distribution Camp for Seniors', vol: 'sourav.patnaik@gmail.com' },
      { task: 'Emergency Flood Relief Kit Assembly & Logistic Packing', vol: 'karthik.raman@gmail.com' },
      { task: 'Urban Flood First Aid & Emergency Dry Ration Packaging', vol: 'vikram.singh@gmail.com' },
      { task: 'Cyclone Shelter Readiness & Emergency First Aid Station Setup', vol: 'ravi.teja@gmail.com' },
      { task: 'Brahmaputra Flash Flood Medical Kit Assembly & Water Purification', vol: 'jatin.baruah@gmail.com' },
      { task: 'Monsoon Waterlogging Relief & Sandbag Embankment Reinforcement', vol: 'kavitha.sridharan@gmail.com' },
      { task: 'Winter Extreme Cold Blanket & Thermal Wear Distribution', vol: 'rajesh.tanwar@gmail.com' },
      { task: 'Public Library Book Cataloging & Blind Student Audio Recording', vol: 'sneha.rao@gmail.com' },
      { task: 'Government Hospital Patient Navigation & Wheelchair Escort', vol: 'rohan.mehta@gmail.com' },
      { task: 'Rockfort Heritage Temple Cleanliness & Pilgrim Guidance Drive', vol: 'aravind.swaminathan@gmail.com' },
      { task: 'Mega Blood Donation Camp Donor Registration & Refreshment Management', vol: 'tanmay.k@gmail.com' },
      { task: 'Government Headquarter Hospital Blood Camp Support & Triage', vol: 'dinesh.chandran@gmail.com' }
    ];

    for (const a of activeAssignments) {
      const taskDoc = taskMap[a.task];
      const volDoc = getVol(a.vol);
      if (taskDoc && volDoc) {
        const app = new Application({
          taskId: taskDoc._id,
          volunteerId: volDoc._id,
          status: 'Assigned',
          notes: 'Assigned for active on-ground volunteer drive.',
          appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
        await app.save();
      }
    }

    console.log('[SEED] Demo database seeded successfully with Tamil Nadu and Pan-India coverage!');
    console.log('[SEED] Summary:');
    console.log(`       - 1 Admin user: admin@communityhelphub.in`);
    console.log(`       - ${createdNGOs.length} Verified NGOs (8 Tamil Nadu + 19 Pan-India)`);
    console.log(`       - ${createdVolunteers.length} Active Volunteers (12 Tamil Nadu + 25 Pan-India)`);
    console.log(`       - Total registered users: ${1 + createdNGOs.length + createdVolunteers.length}`);
    console.log(`       - ${createdTasks.length} Community tasks across all 6 categories`);
    console.log(`       - 6 Verified Certificates generated`);
    console.log(`       - ${activeAssignments.length} Active on-ground assignments`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    process.exit(1);
  }
};

seedData();
