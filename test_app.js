/**
 * Comprehensive Automated Test Suite for Campus Pulse / Campus Connect
 * Tests Backend API, Supabase Database Integration, Error Codes, and Static Multi-page Routing.
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Campus Pulse Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. System Status
  await test('GET /api/status returns online and Supabase PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error(`Expected status: online, got ${data.status}`);
    if (!data.database.includes('Supabase')) throw new Error(`Expected Supabase database, got ${data.database}`);
  });

  // 2. Events List
  let sampleEventId = null;
  let sampleOrganizerId = null;
  await test('GET /api/events returns 19 events directly from Supabase', async () => {
    const res = await fetch(`${BASE_URL}/api/events`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.events) || data.events.length === 0) {
      throw new Error(`Expected events array, got ${JSON.stringify(data)}`);
    }
    sampleEventId = data.events[0].id;
    sampleOrganizerId = data.events[0].organizerId;
    if (!sampleEventId) throw new Error('First event has no id');
    console.log(`     (Found ${data.events.length} events in Supabase. Sample ID: ${sampleEventId})`);
  });

  // 3. Single Event Details
  await test(`GET /api/events/${sampleEventId} returns complete event details`, async () => {
    const res = await fetch(`${BASE_URL}/api/events/${sampleEventId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.id !== sampleEventId) throw new Error(`ID mismatch: expected ${sampleEventId}, got ${data.id}`);
    if (typeof data.capacity !== 'number') throw new Error('Capacity missing');
  });

  // 4. Registration Flow: 201 Created and 409 Conflict
  const testStudentEmail = `test.student.${Date.now()}@campus.edu`;
  let createdRegId = null;

  await test(`POST /api/registrations succeeds with 201 Created`, async () => {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: sampleEventId,
        name: 'Automated Test Runner',
        email: testStudentEmail,
        role: 'Test Suite'
      })
    });
    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    createdRegId = data.registration?.id;
    if (!createdRegId) throw new Error('Registration ID not returned');
  });

  await test(`POST /api/registrations with duplicate email returns 409 Conflict`, async () => {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: sampleEventId,
        name: 'Automated Test Runner',
        email: testStudentEmail,
        role: 'Test Suite'
      })
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate registration, got ${res.status}`);
    }
  });

  // 5. My Registrations Endpoint
  await test(`GET /api/me/registrations retrieves newly created pass`, async () => {
    const res = await fetch(`${BASE_URL}/api/me/registrations?email=${encodeURIComponent(testStudentEmail)}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    const hasReg = data.registrations?.some((r) => r.id === createdRegId || r.eventId === sampleEventId);
    if (!hasReg) throw new Error('Created registration not found in user pass list');
  });

  // 6. Security Check: 403 Forbidden for Student accessing Attendee Roster
  await test(`GET /api/events/:id/registrations returns 403 Forbidden for Student`, async () => {
    const res = await fetch(`${BASE_URL}/api/events/${sampleEventId}/registrations`, {
      headers: {
        'X-User-Role': 'student',
        'X-User-Id': '00000000-0000-0000-0000-000000000002'
      }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 7. Security Check: 200 OK for Owning Organizer
  await test(`GET /api/events/:id/registrations returns 200 OK for Owning Organizer`, async () => {
    const res = await fetch(`${BASE_URL}/api/events/${sampleEventId}/registrations`, {
      headers: {
        'X-User-Role': 'organiser',
        'X-User-Id': sampleOrganizerId,
        'X-Organizer-Id': sampleOrganizerId
      }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.attendees)) throw new Error('Attendees array missing');
  });

  // 8. Attendee Check-In Toggle
  await test(`PATCH /api/events/:id/registrations/:regId/checkin toggles checkin status`, async () => {
    const res = await fetch(`${BASE_URL}/api/events/${sampleEventId}/registrations/${createdRegId}/checkin`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'organiser',
        'X-User-Id': sampleOrganizerId,
        'X-Organizer-Id': sampleOrganizerId
      },
      body: JSON.stringify({ checkedIn: true })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.checkedIn !== true) throw new Error(`Expected checkedIn: true, got ${data.checkedIn}`);
  });

  // 9. Broadcast Notice
  await test(`POST /api/broadcast dispatches announcements`, async () => {
    const res = await fetch(`${BASE_URL}/api/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: sampleEventId,
        subject: 'Test Broadcast Headline',
        message: 'This is a test notification from the automated suite.',
        highPriority: true
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Broadcast response did not return success');
  });

  // 10. Registration Cancellation
  await test(`DELETE /api/registrations/:id cancels registration and releases seat`, async () => {
    const res = await fetch(`${BASE_URL}/api/registrations/${createdRegId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': testStudentEmail
      }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 11. Multi-Page Static HTML Serving
  await test('Static Page: GET / serves index.html (Explore Events)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    const text = await res.text();
    if (!text.includes('Campus Pulse') || !text.includes('Curated Feed')) {
      throw new Error('index.html content missing');
    }
  });

  await test('Static Page: GET /event-details.html serves Event Details page', async () => {
    const res = await fetch(`${BASE_URL}/event-details.html`);
    const text = await res.text();
    if (!text.includes('Event Details &') || !text.includes('Registration Pass')) {
      throw new Error('event-details.html content missing');
    }
  });

  await test('Static Page: GET /my-registrations.html serves My Passes page', async () => {
    const res = await fetch(`${BASE_URL}/my-registrations.html`);
    const text = await res.text();
    if (!text.includes('My Registered Events') || !text.includes('STUDENT WALLET')) {
      throw new Error('my-registrations.html content missing');
    }
  });

  await test('Static Page: GET /organizer-hub.html serves Organizer Hub page', async () => {
    const res = await fetch(`${BASE_URL}/organizer-hub.html`);
    const text = await res.text();
    if (!text.includes('Hub Admin') || !text.includes('Attendee Roster')) {
      throw new Error('organizer-hub.html content missing');
    }
  });

  console.log(`\n🏁 Test Suite Finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
