const BASE_URL = 'http://localhost:5000/api';

const runAudit = async () => {
  console.log('================================================================');
  console.log('  COMMUNITYHELP HUB - END-TO-END SYSTEM AUDIT & VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (name, condition, details = '') => {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  const req = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType.includes('application/pdf')) {
      data = await res.arrayBuffer();
    }
    return { status: res.status, ok: res.ok, data, headers: res.headers };
  };

  try {
    const timestamp = Date.now();

    // 1. Volunteer Registration - Success
    const volEmail = `test.volunteer.${timestamp}@gmail.com`;
    const res1 = await req('/auth/register-volunteer', 'POST', {
      fullName: 'Audit Volunteer',
      email: volEmail,
      password: 'password123',
      phone: '9840123456',
      city: 'Chennai',
      skills: ['Teaching', 'English', 'First Aid']
    });
    test('1. Volunteer Registration (Valid Data)', res1.status === 201 && res1.data.token);
    const volToken = res1.data ? res1.data.token : null;

    // 2. Volunteer Registration - Invalid Email format
    const res2 = await req('/auth/register-volunteer', 'POST', {
      fullName: 'Bad Email',
      email: 'not-an-email',
      password: 'password123',
      phone: '9840123456',
      city: 'Chennai'
    });
    test('2. Volunteer Registration (Invalid Email Rejected)', res2.status === 400);

    // 3. Volunteer Registration - Invalid Phone format (e.g. 5 digits)
    const res3 = await req('/auth/register-volunteer', 'POST', {
      fullName: 'Bad Phone',
      email: `badphone.${timestamp}@gmail.com`,
      password: 'password123',
      phone: '12345',
      city: 'Chennai'
    });
    test('3. Volunteer Registration (Invalid Phone Rejected)', res3.status === 400);

    // 4. Volunteer Registration - Short Password (< 6 chars)
    const res4 = await req('/auth/register-volunteer', 'POST', {
      fullName: 'Short Pass',
      email: `shortpass.${timestamp}@gmail.com`,
      password: '123',
      phone: '9840123456',
      city: 'Chennai'
    });
    test('4. Volunteer Registration (Short Password Rejected)', res4.status === 400);

    // 5. Volunteer Registration - Duplicate Email Check
    const res5 = await req('/auth/register-volunteer', 'POST', {
      fullName: 'Duplicate Vol',
      email: volEmail,
      password: 'password123',
      phone: '9840123456',
      city: 'Chennai'
    });
    test('5. Volunteer Registration (Duplicate Email Rejected)', res5.status === 400);

    // 6. NGO Registration - Success
    const ngoEmail = `test.ngo.${timestamp}@ngo.org`;
    const ngoRegNo = `NGO-AUDIT-${timestamp}`;
    const res6 = await req('/auth/register-ngo', 'POST', {
      orgName: 'Audit Relief Foundation',
      registrationNumber: ngoRegNo,
      contactPerson: 'Audit Director',
      email: ngoEmail,
      password: 'password123',
      phone: '9842111222',
      city: 'Coimbatore',
      address: '100, Crosscut Road, Coimbatore'
    });
    test('6. NGO Registration (Valid Data)', res6.status === 201 && res6.data.token);
    const ngoToken = res6.data ? res6.data.token : null;

    // 7. NGO Registration - Duplicate Reg Number Check
    const res7 = await req('/auth/register-ngo', 'POST', {
      orgName: 'Second NGO',
      registrationNumber: ngoRegNo,
      contactPerson: 'Another Person',
      email: `another.${timestamp}@ngo.org`,
      password: 'password123',
      phone: '9842111333',
      city: 'Coimbatore'
    });
    test('7. NGO Registration (Duplicate Registration Number Rejected)', res7.status === 400);

    // 8. User Login - Success
    const res8 = await req('/auth/login', 'POST', {
      email: volEmail,
      password: 'password123'
    });
    test('8. User Login (Valid Credentials)', res8.status === 200 && res8.data.user.role === 'volunteer');

    // 9. User Login - Wrong Password
    const res9 = await req('/auth/login', 'POST', {
      email: volEmail,
      password: 'wrongpassword'
    });
    test('9. User Login (Wrong Password Rejected)', res9.status === 401);

    // 10. Task Creation - Success (NGO Token)
    const res10 = await req('/tasks', 'POST', {
      title: 'Audit Beach Cleaning Drive',
      description: 'Collect microplastics and marine debris along coastal tide lines.',
      category: 'Environment',
      requiredSkills: ['Clean-up', 'First Aid'],
      location: 'Besant Nagar Promenade',
      city: 'Chennai',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 4,
      volunteersRequired: 5
    }, ngoToken);
    test('10. Task Creation (Valid NGO Input)', res10.status === 201 && res10.data.task._id);
    const createdTaskId = res10.data && res10.data.task ? res10.data.task._id : null;

    // 11. Task Creation - Invalid Category (Must be 1 of 6)
    const res11 = await req('/tasks', 'POST', {
      title: 'Invalid Category Task',
      description: 'Testing category validation constraint.',
      category: 'Crypto Mining', // Invalid
      location: 'Online',
      city: 'Chennai',
      dateTime: new Date().toISOString(),
      volunteersRequired: 2
    }, ngoToken);
    test('11. Task Creation (Invalid Category Rejected)', res11.status === 400);

    // 12. Task Creation by Volunteer (Unauthorized)
    const res12 = await req('/tasks', 'POST', {
      title: 'Unauthorized Task',
      description: 'Should be rejected because user is volunteer',
      category: 'Education',
      location: 'Local Hall',
      city: 'Chennai',
      dateTime: new Date().toISOString(),
      volunteersRequired: 2
    }, volToken);
    test('12. Task Creation (Volunteer Role Forbidden 403)', res12.status === 403);

    // 13. Task Update (CRUD Update) by Owner NGO
    const res13 = await req(`/tasks/${createdTaskId}`, 'PUT', {
      title: 'Audit Beach Cleaning Drive - Updated Title',
      hours: 5
    }, ngoToken);
    test('13. Task Update (PUT by Owner NGO)', res13.status === 200 && res13.data.task.hours === 5);

    // 14. Task Application by Volunteer
    const res14 = await req('/applications/apply', 'POST', {
      taskId: createdTaskId,
      notes: 'Excited to contribute to coastal conservation!'
    }, volToken);
    test('14. Task Application by Volunteer', res14.status === 201 && res14.data.application._id);
    const applicationId = res14.data && res14.data.application ? res14.data.application._id : null;

    // 15. Duplicate Task Application Check
    const res15 = await req('/applications/apply', 'POST', {
      taskId: createdTaskId,
      notes: 'Applying again should fail'
    }, volToken);
    test('15. Duplicate Task Application (Enforced & Rejected)', res15.status === 400);

    // 16. Task Assignment by NGO
    const res16 = await req(`/applications/${applicationId}/status`, 'PUT', {
      status: 'Assigned'
    }, ngoToken);
    test('16. Application Assignment by NGO (Status: Assigned)', res16.status === 200 && res16.data.application.status === 'Assigned');

    // 17. Task Completion by NGO -> Auto-awards points & creates Certificate
    const res17 = await req(`/applications/${applicationId}/status`, 'PUT', {
      status: 'Completed'
    }, ngoToken);
    test('17. Task Completion by NGO (Status: Completed)', res17.status === 200);

    // 18. Certificate Generation & Verification
    const res18 = await req('/certificates/my-certificates', 'GET', null, volToken);
    const cert = res18.data && res18.data.certificates && res18.data.certificates.length > 0 ? res18.data.certificates[0] : null;
    test('18. Automatic Certificate Generation on Completion', res18.status === 200 && cert !== null);
    const certId = cert ? cert._id : null;

    // 19. Certificate PDF Download (PDFKit)
    if (certId) {
      const res19 = await req(`/certificates/download/${certId}`, 'GET');
      const isPdf = res19.headers.get('content-type') === 'application/pdf';
      test('19. Certificate PDF Generation & Download (PDFKit stream)', res19.status === 200 && isPdf);
    } else {
      test('19. Certificate PDF Download', false, 'No certificate ID available');
    }

    // 20. Skill Matching Algorithm
    const res20 = await req('/tasks/matching/skills', 'GET', null, volToken);
    test('20. Skill-Based Volunteer Matching API', res20.status === 200 && Array.isArray(res20.data.tasks));

    // 21. Location-Based Matching Algorithm
    const res21 = await req('/tasks/matching/location', 'GET', null, volToken);
    test('21. Location-Based Matching API (Local Match Flagging)', res21.status === 200 && res21.data.volunteerCity === 'Chennai');

    // 22. AI Recommendations Algorithm
    const res22 = await req('/tasks/recommendations/ai', 'GET', null, volToken);
    test('22. AI Task Recommendations API (100-Point Heuristic Scoring)', res22.status === 200 && Array.isArray(res22.data.recommendations));

    // 23. Impact Analytics Dashboard API
    const res23 = await req('/dashboard/impact', 'GET');
    test('23. Impact Analytics Dashboard (6 Categories + Metrics)', res23.status === 200 && res23.data.categoryData.length === 6);

    // 24. Volunteer Rankings Leaderboard API
    const res24 = await req('/dashboard/rankings', 'GET');
    test('24. Volunteer Rankings Leaderboard API', res24.status === 200 && res24.data.rankings.length > 0);

    // 25. Task Deletion (CRUD Delete) by Owner NGO
    const res25 = await req(`/tasks/${createdTaskId}`, 'DELETE', null, ngoToken);
    test('25. Task Deletion (CRUD Delete by Owner NGO)', res25.status === 200);

  } catch (err) {
    console.error('[UNEXPECTED ERROR IN AUDIT]', err);
  }

  console.log('\n================================================================');
  console.log(`  AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED (${passed + failed} TOTAL TESTS)`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runAudit();
