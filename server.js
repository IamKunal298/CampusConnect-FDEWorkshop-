import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  isSupabaseConfigured,
  dbGetEvents,
  dbGetEventById,
  dbRegisterUser,
  dbGetUserRegistrations,
  dbGetEventAttendees
} from './supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock database initialized with vivid campus data matching wireframes and showcase images
const initialEvents = [
  {
    id: 'evt_1',
    title: 'Design Thinking Lab',
    category: 'Workshops',
    badge: 'DT',
    tag: 'WORKSHOP',
    date: 'NOV 04',
    isoDate: '2026-11-04',
    time: '2:00 PM - 5:00 PM',
    location: 'Innovation Hub • Room 204',
    host: 'Hosted by campus community',
    organizer: 'Design Guild & Creative Studio',
    organizerId: 'org_elena',
    organizerName: 'Elena Rostova',
    organizerEmail: 'elena.rostova@campus.edu',
    capacity: 35,
    registeredCount: 31,
    themeColor: 'blue', // soft blue pastel
    bannerBg: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#3b82f6',
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in human-centered design sprints! Learn wireframing, rapid user testing, and interactive prototyping alongside peer creators.',
    fullDescription: 'Join the premier campus design accelerator. We cover empathy mapping, persona synthesis, low-fidelity paper prototyping, and digital handoff. Bring your laptop and your wildest campus product ideas. Figma pro accounts & snack bar provided!',
    perks: ['Figma Swag & Stickers', 'Certificate of Completion', 'Gourmet Artisan Coffee & Cookies', 'Portfolio Review Opportunity'],
    speakers: [
      { name: 'Elena Rostova', role: 'Head of Campus Design Guild', company: 'Ex-IDEO Fellow' },
      { name: 'Kunal Verma', role: 'Product Architect', company: 'Linear Labs' }
    ],
    agenda: [
      { time: '2:00 PM', topic: 'Kickoff & Empathy Interviews' },
      { time: '2:45 PM', topic: 'Crazy 8s Ideation Sprint' },
      { time: '3:30 PM', topic: 'Interactive Prototyping Jam' },
      { time: '4:30 PM', topic: 'Lightning Pitches & Feedback' }
    ]
  },
  {
    id: 'evt_2',
    title: 'Campus Connect Mixer',
    category: 'Social',
    badge: 'CC',
    tag: 'COMMUNITY',
    date: 'NOV 06',
    isoDate: '2026-11-06',
    time: '5:30 PM - 8:00 PM',
    location: 'Student Commons',
    host: 'Hosted by campus community',
    organizer: 'Campus Student Council',
    organizerId: 'org_marcus',
    organizerName: 'Marcus Vance',
    organizerEmail: 'marcus.vance@campus.edu',
    capacity: 120,
    registeredCount: 88,
    themeColor: 'green', // soft green pastel
    bannerBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#10b981',
    coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    description: 'The ultimate semester networking mixer! Break the ice with club leaders, find study partners, and vibe with acoustic sets and campus food trucks.',
    fullDescription: 'Whether you are a freshman finding your footing or a senior seeking collaboration partners for capstone projects, the Campus Connect Mixer brings everyone together under the fairy lights of the Student Commons.',
    perks: ['Free Taco Truck Vouchers', 'Club Discovery Fair', 'Acoustic Student Band', 'Speed-Networking Rounds'],
    speakers: [
      { name: 'Marcus Vance', role: 'Student Senate President', company: 'Campus Council' }
    ],
    agenda: [
      { time: '5:30 PM', topic: 'Welcome Drinks & Name Tag Icebreaker' },
      { time: '6:15 PM', topic: 'Campus Project Showcase & Speed Matching' },
      { time: '7:15 PM', topic: 'Live Music & Social Hour' }
    ]
  },
  {
    id: 'evt_3',
    title: 'Careers in AI & Tech',
    category: 'Career',
    badge: 'AI',
    tag: 'CAREER',
    date: 'NOV 08',
    isoDate: '2026-11-08',
    time: '11:00 AM - 1:30 PM',
    location: 'Auditorium B',
    host: 'Hosted by campus community',
    organizer: 'Tech & Robotics Guild',
    organizerId: 'org_elena',
    organizerName: 'Elena Rostova',
    organizerEmail: 'elena.rostova@campus.edu',
    capacity: 150,
    registeredCount: 147,
    themeColor: 'orange', // soft orange pastel
    bannerBg: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#f59e0b',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    description: 'Direct conversations with alumni engineers and AI research scientists from DeepMind, Google, and top startups. Resume reviews & hiring tips.',
    fullDescription: 'Navigate the next frontier of artificial intelligence careers. Learn what recruiters look for in autonomous agent development, LLM fine-tuning, and scalable distributed infrastructure. Includes direct resume drop with tier-1 sponsors.',
    perks: ['Direct Resume Fast-Track', '1-on-1 Alumni Mentorship Match', 'Free API Credits ($100 voucher)', 'Lunch Box Provided'],
    speakers: [
      { name: 'Dr. Aris Thorne', role: 'Staff Research Scientist', company: 'Google DeepMind' },
      { name: 'Maya Lin', role: 'Engineering Manager', company: 'Anthropic Alum' }
    ],
    agenda: [
      { time: '11:00 AM', topic: 'Keynote: State of Autonomous AI in 2026' },
      { time: '11:45 AM', topic: 'Alumni Panel: Navigating Technical Interviews' },
      { time: '12:45 PM', topic: 'Breakout Mentorship & Resume Clinics' }
    ]
  },
  {
    id: 'evt_4',
    title: 'Open Mic Evening',
    category: 'Social',
    badge: '♫',
    tag: 'CULTURE',
    date: 'NOV 10',
    isoDate: '2026-11-10',
    time: '6:00 PM - 9:00 PM',
    location: 'Campus Amphitheatre',
    host: 'Hosted by campus community',
    organizer: 'Creative Arts Society',
    organizerId: 'org_sophia',
    organizerName: 'Sophia Chen',
    organizerEmail: 'sophia.chen@campus.edu',
    capacity: 80,
    registeredCount: 62,
    themeColor: 'pink', // soft pink pastel
    bannerBg: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#f43f5e',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Poetry, acoustic guitars, stand-up comedy, and soulful covers. Grab a warm cider, cheer on your friends, or sign up for a stage slot!',
    fullDescription: 'Under the open campus sky, share your voice or relax with warm artisanal drinks. All performance genres welcome — acoustic sets, beatboxing, spoken word, comedy, or theatrical monologues.',
    perks: ['Hot Spiced Cider & Donuts', 'Professional Stage & Sound Rig', 'Performer Swag Bag', 'Audio Recording of Performance'],
    speakers: [
      { name: 'Sophia Chen', role: 'Artistic Director', company: 'Campus Arts' }
    ],
    agenda: [
      { time: '6:00 PM', topic: 'Acoustic Warmup & Signups' },
      { time: '6:30 PM', topic: 'Spoken Word & Poetry' },
      { time: '7:45 PM', topic: 'Indie & Folk Bands Showcase' }
    ]
  },
  {
    id: 'evt_5',
    title: 'Inter-college Badminton',
    category: 'Sports',
    badge: '↗',
    tag: 'SPORTS',
    date: 'NOV 12',
    isoDate: '2026-11-12',
    time: '9:00 AM - 4:00 PM',
    location: 'Sports Complex',
    host: 'Hosted by campus community',
    organizer: 'Athletics & Badminton Club',
    organizerId: 'org_coach_dave',
    organizerName: 'Coach Dave Miller',
    organizerEmail: 'dave.miller@campus.edu',
    capacity: 32,
    registeredCount: 31, // Almost full (1 seat left!)
    themeColor: 'purple', // soft purple pastel
    bannerBg: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#8b5cf6',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    description: 'Singles and doubles knockout tournament! High adrenaline rallies, trophies for top 3, energy refreshments, and official refereeing.',
    fullDescription: 'Show off your smashes and drops! Certified Yonex shuttlecocks and court mats. All college departments and rival campuses invited. Spectator seating and live commentary throughout the day.',
    perks: ['Championship Medals & Cash Prize', 'Hydration & Protein Snack Bar', 'Official Yonex Tournament T-Shirt', 'Live Bracket Streaming'],
    speakers: [
      { name: 'Dave Miller', role: 'Varsity Head Coach', company: 'Campus Athletics' }
    ],
    agenda: [
      { time: '9:00 AM', topic: 'Player Check-in & Racket Inspection' },
      { time: '9:45 AM', topic: 'Singles Knockout Rounds' },
      { time: '1:30 PM', topic: 'Doubles Semifinals & Finals' },
      { time: '3:45 PM', topic: 'Podium & Trophy Ceremony' }
    ]
  },
  {
    id: 'evt_6',
    title: 'Community Care Day',
    category: 'Volunteer',
    badge: '♡',
    tag: 'VOLUNTEER',
    date: 'NOV 14',
    isoDate: '2026-11-14',
    time: '8:30 AM - 1:00 PM',
    location: 'Main Gate • Meet-up',
    host: 'Hosted by campus community',
    organizer: 'Campus Social Outreach & Green Society',
    organizerId: 'org_maya',
    organizerName: 'Maya Patel',
    organizerEmail: 'maya.patel@campus.edu',
    capacity: 50,
    registeredCount: 50, // SOLD OUT - triggers 409 Conflict (Full capacity)
    themeColor: 'teal', // soft cyan/teal pastel
    bannerBg: 'bg-teal-50 text-teal-700 border-teal-200',
    accentColor: '#0d9488',
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    description: 'Urban forestry planting, campus eco-clean drive, and local food shelter packaging. Give back with your classmates and earn volunteer credits.',
    fullDescription: 'Join over 50 dedicated students for an impactful Saturday morning. Gloves, saplings, gardening tools, and safety vests provided. Earn verified community service hours for scholarships and honour societies.',
    perks: ['Verified 5 Hours Community Service Certificate', 'Campus Volunteer Commemorative Badge', 'Complimentary Breakfast Bagels & Juice', 'Free Campus Outreach Hoodie'],
    speakers: [
      { name: 'Maya Patel', role: 'Outreach Director', company: 'Green Campus Initiative' }
    ],
    agenda: [
      { time: '8:30 AM', topic: 'Meet-up at Main Gate & Tool Distribution' },
      { time: '9:00 AM', topic: 'Sapling Planting on East Meadow' },
      { time: '11:00 AM', topic: 'Food Shelter Box Packaging' },
      { time: '12:30 PM', topic: 'Wrap-up & Certificate Sign-off' }
    ]
  }
];

// In-memory registration data
let events = JSON.parse(JSON.stringify(initialEvents));

let registrations = [
  // Karan Gupta (Current demo student 'KG') starts with one confirmed registration:
  {
    id: 'reg_1001',
    eventId: 'evt_2',
    name: 'Karan Gupta',
    email: 'karan.gupta@campus.edu',
    age: 21,
    phone: '+1 (555) 234-8901',
    role: 'Computer Science Jr.',
    department: 'School of Engineering',
    ticketCode: 'CC-MIX-1001',
    qrData: 'CAMPUS-CONNECT:reg_1001:karan.gupta@campus.edu:evt_2',
    registeredAt: '2026-10-24T10:15:00.000Z',
    checkedIn: false,
    status: 'CONFIRMED'
  },
  // Elena Rostova's event 'evt_1' has several registrations for organizer demo
  {
    id: 'reg_1002',
    eventId: 'evt_1',
    name: 'Aisha Al-Mansoor',
    email: 'aisha.m@campus.edu',
    age: 20,
    phone: '+1 (555) 902-3341',
    role: 'Product Design So.',
    department: 'Arts & Media',
    ticketCode: 'CC-DTL-1002',
    qrData: 'CAMPUS-CONNECT:reg_1002:aisha.m@campus.edu:evt_1',
    registeredAt: '2026-10-25T14:20:00.000Z',
    checkedIn: true,
    status: 'CONFIRMED'
  },
  {
    id: 'reg_1003',
    eventId: 'evt_1',
    name: 'Liam Zhang',
    email: 'liam.zhang@campus.edu',
    age: 22,
    phone: '+1 (555) 441-9982',
    role: 'Cognitive Science Sr.',
    department: 'Interdisciplinary Studies',
    ticketCode: 'CC-DTL-1003',
    qrData: 'CAMPUS-CONNECT:reg_1003:liam.zhang@campus.edu:evt_1',
    registeredAt: '2026-10-26T09:40:00.000Z',
    checkedIn: false,
    status: 'CONFIRMED'
  },
  {
    id: 'reg_1004',
    eventId: 'evt_1',
    name: 'Priya Sharma',
    email: 'priya.s@campus.edu',
    age: 19,
    phone: '+1 (555) 781-1204',
    role: 'HCI & UX Fr.',
    department: 'Computer Science',
    ticketCode: 'CC-DTL-1004',
    qrData: 'CAMPUS-CONNECT:reg_1004:priya.s@campus.edu:evt_1',
    registeredAt: '2026-10-27T16:05:00.000Z',
    checkedIn: true,
    status: 'CONFIRMED'
  },
  {
    id: 'reg_1005',
    eventId: 'evt_3',
    name: 'Devon Miller',
    email: 'devon.m@campus.edu',
    age: 23,
    phone: '+1 (555) 303-9112',
    role: 'M.S. Robotics',
    department: 'Graduate School',
    ticketCode: 'CC-AI-1005',
    qrData: 'CAMPUS-CONNECT:reg_1005:devon.m@campus.edu:evt_3',
    registeredAt: '2026-10-28T11:10:00.000Z',
    checkedIn: false,
    status: 'CONFIRMED'
  }
];

// Helper to find event
const findEvent = (id) => events.find((e) => e.id === id);

// ==========================================
// 0. GET /api/status - Architecture & Supabase Health Status
// ==========================================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Campus Connect',
    database: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Memory Storage',
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. GET /api/events - Browse events
// ==========================================
app.get('/api/events', async (req, res) => {
  const { category, q, availableOnly, tag } = req.query;

  // Supabase Database Execution (when SUPABASE_URL configured)
  if (isSupabaseConfigured()) {
    try {
      const dbEvents = await dbGetEvents({ category, q, availableOnly: availableOnly === 'true' });
      if (dbEvents && dbEvents.length > 0) {
        return res.json({
          count: dbEvents.length,
          total: dbEvents.length,
          events: dbEvents,
          database: 'supabase'
        });
      }
    } catch (err) {
      console.warn('⚠️ Supabase getEvents query failed, falling back to local memory:', err.message);
    }
  }

  // Local Memory Fallback
  let results = [...events];

  if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all events') {
    results = results.filter(
      (e) =>
        e.category.toLowerCase() === category.toLowerCase() ||
        e.tag.toLowerCase() === category.toLowerCase()
    );
  }

  if (tag) {
    results = results.filter((e) => e.tag.toLowerCase() === tag.toLowerCase());
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.organizer.toLowerCase().includes(query) ||
        e.tag.toLowerCase().includes(query)
    );
  }

  if (availableOnly === 'true') {
    results = results.filter((e) => e.registeredCount < e.capacity);
  }

  res.json({
    count: results.length,
    total: events.length,
    events: results,
    database: 'local_memory'
  });
});

// ==========================================
// 2. GET /api/events/:id - Event details
// ==========================================
app.get('/api/events/:id', async (req, res) => {
  // Supabase Database Execution
  if (isSupabaseConfigured()) {
    try {
      const dbEvent = await dbGetEventById(req.params.id);
      if (dbEvent) {
        return res.json({ event: dbEvent, database: 'supabase' });
      }
    } catch (err) {
      console.warn('⚠️ Supabase getEventById query failed, falling back:', err.message);
    }
  }

  const event = findEvent(req.params.id);

  if (!event) {
    return res.status(404).json({
      error: 'Not Found',
      code: 'EVENT_NOT_FOUND',
      message: `Event with id "${req.params.id}" does not exist.`
    });
  }

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isSoldOut = seatsLeft === 0;

  res.json({
    event: {
      ...event,
      seatsLeft,
      isSoldOut,
      percentFilled: Math.round((event.registeredCount / event.capacity) * 100)
    },
    database: 'local_memory'
  });
});

// ==========================================
// 3. POST /api/registrations - Create registration, 201 or 409
// ==========================================
app.post('/api/registrations', async (req, res) => {
  const { eventId, name, email, age, phone, role, department, notes } = req.body;

  // Validation
  if (!eventId || !name || !email) {
    return res.status(400).json({
      error: 'Bad Request',
      code: 'MISSING_FIELDS',
      message: 'eventId, name, and email are required fields.'
    });
  }

  // Supabase Database Execution (when SUPABASE_URL is configured)
  if (isSupabaseConfigured()) {
    try {
      const dbReg = await dbRegisterUser(req.body);
      if (dbReg) {
        return res.status(201).json({
          message: 'Successfully Registered',
          code: 'REGISTRATION_SUCCESS',
          registration: dbReg,
          database: 'supabase'
        });
      }
    } catch (err) {
      if (err.status === 409 || err.status === 404 || err.status === 400) {
        return res.status(err.status).json(err.data || { error: err.message, code: 'CONFLICT' });
      }
      console.warn('⚠️ Supabase registerUser failed, falling back to local memory:', err.message);
    }
  }

  const event = findEvent(eventId);
  if (!event) {
    return res.status(404).json({
      error: 'Not Found',
      code: 'EVENT_NOT_FOUND',
      message: `Cannot register: Event "${eventId}" does not exist.`
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check 1: Duplicate Registration Conflict (409)
  const existingReg = registrations.find(
    (r) => r.eventId === eventId && r.email.toLowerCase() === normalizedEmail
  );

  if (existingReg) {
    return res.status(409).json({
      error: 'Conflict',
      code: 'DUPLICATE_REGISTRATION',
      message: `A registration for "${normalizedEmail}" already exists for "${event.title}".`,
      details: {
        ticketCode: existingReg.ticketCode,
        registeredAt: existingReg.registeredAt,
        status: existingReg.status
      }
    });
  }

  // Check 2: Capacity Full Conflict (409)
  if (event.registeredCount >= event.capacity) {
    return res.status(409).json({
      error: 'Conflict',
      code: 'CAPACITY_REACHED',
      message: `Registration closed: "${event.title}" has reached its maximum capacity limit of ${event.capacity} attendees.`,
      capacity: event.capacity,
      registeredCount: event.registeredCount
    });
  }

  // Successful registration creation (201)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newRegistrationId = `reg_${Date.now().toString(36)}_${randomSuffix}`;
  const codePrefix = event.badge ? event.badge.replace(/[^A-Za-z]/g, '') || 'EVT' : 'EVT';
  const ticketCode = `CC-${codePrefix}-${randomSuffix}`;
  const qrData = `CAMPUS-CONNECT:${newRegistrationId}:${normalizedEmail}:${event.id}:${ticketCode}`;

  const newReg = {
    id: newRegistrationId,
    eventId: event.id,
    name: name.trim(),
    email: normalizedEmail,
    age: age ? parseInt(age, 10) || age : 20,
    phone: phone ? phone.trim() : 'N/A',
    role: role ? role.trim() : 'Undergraduate Student',
    department: department ? department.trim() : 'Campus Community',
    notes: notes || '',
    ticketCode,
    qrData,
    registeredAt: new Date().toISOString(),
    checkedIn: false,
    status: 'CONFIRMED'
  };

  registrations.push(newReg);
  event.registeredCount += 1;

  res.status(201).json({
    message: 'Successfully Registered',
    code: 'REGISTRATION_SUCCESS',
    registration: newReg,
    database: 'local_memory',
    eventSummary: {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      badge: event.badge,
      tag: event.tag,
      remainingSeats: event.capacity - event.registeredCount
    }
  });
});

// ==========================================
// 4. GET /api/me/registrations - Current user's registrations
// ==========================================
app.get('/api/me/registrations', async (req, res) => {
  // Read current user from header or query param, defaulting to demo user 'karan.gupta@campus.edu'
  const userEmail = (
    req.headers['x-user-email'] ||
    req.query.email ||
    'karan.gupta@campus.edu'
  ).toString().toLowerCase();

  // Supabase Database Execution (when SUPABASE_URL configured)
  if (isSupabaseConfigured()) {
    try {
      const dbRegs = await dbGetUserRegistrations(userEmail);
      if (dbRegs) {
        return res.json({
          userEmail,
          count: dbRegs.length,
          registrations: dbRegs,
          database: 'supabase'
        });
      }
    } catch (err) {
      console.warn('⚠️ Supabase getUserRegistrations query failed, falling back:', err.message);
    }
  }

  const userRegs = registrations.filter((r) => r.email.toLowerCase() === userEmail);

  const enriched = userRegs.map((reg) => {
    const event = findEvent(reg.eventId);
    return {
      ...reg,
      event: event || {
        id: reg.eventId,
        title: 'Archived Event',
        date: 'TBD',
        location: 'Campus'
      }
    };
  });

  res.json({
    userEmail,
    count: enriched.length,
    registrations: enriched,
    database: 'local_memory'
  });
});

// ==========================================
// 5. GET /api/events/{id}/registrations - Attendee list, OWNING ORGANIZER ONLY
// ==========================================
app.get('/api/events/:id/registrations', async (req, res) => {
  const role = (req.headers['x-user-role'] || req.query.role || 'student').toString().toLowerCase();
  const requesterId = (req.headers['x-organizer-id'] || req.headers['x-user-id'] || req.query.organizerId || '').toString();
  const requesterEmail = (req.headers['x-user-email'] || req.query.email || '').toString().toLowerCase();

  // Supabase Database Execution (when SUPABASE_URL configured)
  if (isSupabaseConfigured()) {
    try {
      const roster = await dbGetEventAttendees(req.params.id, {
        role,
        organizerId: requesterId,
        email: requesterEmail
      });
      if (roster) {
        return res.json({ ...roster, database: 'supabase' });
      }
    } catch (err) {
      if (err.status === 403 || err.status === 404) {
        return res.status(err.status).json(err.data || { error: err.message });
      }
      console.warn('⚠️ Supabase getEventAttendees failed, falling back:', err.message);
    }
  }

  const event = findEvent(req.params.id);

  if (!event) {
    return res.status(404).json({
      error: 'Not Found',
      code: 'EVENT_NOT_FOUND',
      message: `Event "${req.params.id}" does not exist.`
    });
  }

  const isOrganizerRole = role === 'organizer' || role === 'organiser';
  const isOwningOrganizer =
    isOrganizerRole &&
    (requesterId === event.organizerId || requesterEmail === event.organizerEmail.toLowerCase());

  // Strict owning organizer enforcement:
  if (!isOwningOrganizer) {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'ORGANIZER_ACCESS_ONLY',
      message: 'Access Denied: The attendee list is restricted to the owning organizer of this event only.',
      owningOrganizer: {
        name: event.organizerName,
        email: event.organizerEmail,
        id: event.organizerId
      },
      currentRequester: {
        role,
        id: requesterId || 'anonymous',
        email: requesterEmail || 'not provided'
      }
    });
  }

  // Owning organizer authenticated: return attendee list
  const attendees = registrations
    .filter((r) => r.eventId === event.id)
    .map((r) => ({
      id: r.id,
      ticketCode: r.ticketCode,
      name: r.name,
      email: r.email,
      phone: r.phone,
      age: r.age,
      role: r.role,
      department: r.department,
      registeredAt: r.registeredAt,
      checkedIn: r.checkedIn,
      notes: r.notes
    }));

  res.json({
    event: {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      registeredCount: attendees.length
    },
    owningOrganizer: {
      id: event.organizerId,
      name: event.organizerName,
      email: event.organizerEmail
    },
    count: attendees.length,
    attendees,
    database: 'local_memory'
  });
});

// ==========================================
// Extra Utility: Toggle Attendee Check-in (Owning Organizer Only)
// ==========================================
app.patch('/api/events/:id/registrations/:regId/checkin', (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const role = (req.headers['x-user-role'] || req.query.role || '').toString().toLowerCase();
  const requesterId = (req.headers['x-organizer-id'] || req.headers['x-user-id'] || '').toString();

  if (role !== 'organizer' || requesterId !== event.organizerId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only the owning organizer can mark attendee check-in.'
    });
  }

  const reg = registrations.find((r) => r.id === req.params.regId && r.eventId === event.id);
  if (!reg) return res.status(404).json({ error: 'Registration not found' });

  reg.checkedIn = !reg.checkedIn;
  res.json({
    message: `Attendee ${reg.name} is now ${reg.checkedIn ? 'CHECKED IN' : 'NOT CHECKED IN'}`,
    registrationId: reg.id,
    checkedIn: reg.checkedIn
  });
});

// ==========================================
// Extra Utility: Reset Demo Seed Data
// ==========================================
app.post('/api/seed/reset', (req, res) => {
  events = JSON.parse(JSON.stringify(initialEvents));
  registrations = [
    {
      id: 'reg_1001',
      eventId: 'evt_2',
      name: 'Karan Gupta',
      email: 'karan.gupta@campus.edu',
      age: 21,
      phone: '+1 (555) 234-8901',
      role: 'Computer Science Jr.',
      department: 'School of Engineering',
      ticketCode: 'CC-MIX-1001',
      qrData: 'CAMPUS-CONNECT:reg_1001:karan.gupta@campus.edu:evt_2',
      registeredAt: '2026-10-24T10:15:00.000Z',
      checkedIn: false,
      status: 'CONFIRMED'
    },
    {
      id: 'reg_1002',
      eventId: 'evt_1',
      name: 'Aisha Al-Mansoor',
      email: 'aisha.m@campus.edu',
      age: 20,
      phone: '+1 (555) 902-3341',
      role: 'Product Design So.',
      department: 'Arts & Media',
      ticketCode: 'CC-DTL-1002',
      qrData: 'CAMPUS-CONNECT:reg_1002:aisha.m@campus.edu:evt_1',
      registeredAt: '2026-10-25T14:20:00.000Z',
      checkedIn: true,
      status: 'CONFIRMED'
    },
    {
      id: 'reg_1003',
      eventId: 'evt_1',
      name: 'Liam Zhang',
      email: 'liam.zhang@campus.edu',
      age: 22,
      phone: '+1 (555) 441-9982',
      role: 'Cognitive Science Sr.',
      department: 'Interdisciplinary Studies',
      ticketCode: 'CC-DTL-1003',
      qrData: 'CAMPUS-CONNECT:reg_1003:liam.zhang@campus.edu:evt_1',
      registeredAt: '2026-10-26T09:40:00.000Z',
      checkedIn: false,
      status: 'CONFIRMED'
    },
    {
      id: 'reg_1004',
      eventId: 'evt_1',
      name: 'Priya Sharma',
      email: 'priya.s@campus.edu',
      age: 19,
      phone: '+1 (555) 781-1204',
      role: 'HCI & UX Fr.',
      department: 'Computer Science',
      ticketCode: 'CC-DTL-1004',
      qrData: 'CAMPUS-CONNECT:reg_1004:priya.s@campus.edu:evt_1',
      registeredAt: '2026-10-27T16:05:00.000Z',
      checkedIn: true,
      status: 'CONFIRMED'
    },
    {
      id: 'reg_1005',
      eventId: 'evt_3',
      name: 'Devon Miller',
      email: 'devon.m@campus.edu',
      age: 23,
      phone: '+1 (555) 303-9112',
      role: 'M.S. Robotics',
      department: 'Graduate School',
      ticketCode: 'CC-AI-1005',
      qrData: 'CAMPUS-CONNECT:reg_1005:devon.m@campus.edu:evt_3',
      registeredAt: '2026-10-28T11:10:00.000Z',
      checkedIn: false,
      status: 'CONFIRMED'
    }
  ];
  res.json({ message: 'Campus Connect database reset to initial state successfully.' });
});

// Serve frontend static build if exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Campus Connect API server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available:`);
    console.log(`   GET    /api/events`);
    console.log(`   GET    /api/events/:id`);
    console.log(`   POST   /api/registrations (201 / 409)`);
    console.log(`   GET    /api/me/registrations`);
    console.log(`   GET    /api/events/:id/registrations (Owning organizer only)`);
  });
}

export default app;
