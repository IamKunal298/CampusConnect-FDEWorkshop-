import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_KEY?.trim();

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
};

let supabaseClient = null;

if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log(`🔌 Supabase Client initialized successfully with URL: ${SUPABASE_URL}`);
  } catch (err) {
    console.error('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️  Running in Local Storage Mode (Supabase credentials not configured in .env).');
}

export const getSupabase = () => supabaseClient;

// Helper to provide nice badges & categories based on event title
function enrichEventForUI(evt, registrationsCount = 0) {
  const dateObj = evt.timestamp ? new Date(evt.timestamp) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Infer badge & category from title
  let badge = 'CC';
  let category = 'Workshops';
  let tag = 'WORKSHOP';
  let themeColor = 'blue';

  const t = (evt.title || '').toLowerCase();
  if (t.includes('design')) {
    badge = 'DT';
    category = 'Workshops';
    tag = 'WORKSHOP';
    themeColor = 'blue';
  } else if (t.includes('mixer') || t.includes('connect')) {
    badge = 'CC';
    category = 'Social';
    tag = 'COMMUNITY';
    themeColor = 'green';
  } else if (t.includes('ai') || t.includes('career') || t.includes('tech')) {
    badge = 'AI';
    category = 'Career';
    tag = 'CAREER';
    themeColor = 'orange';
  } else if (t.includes('music') || t.includes('mic') || t.includes('culture')) {
    badge = '♫';
    category = 'Culture';
    tag = 'CULTURE';
    themeColor = 'pink';
  } else if (t.includes('badminton') || t.includes('sports')) {
    badge = '↗';
    category = 'Sports';
    tag = 'SPORTS';
    themeColor = 'purple';
  } else if (t.includes('care') || t.includes('volunteer')) {
    badge = '♡';
    category = 'Volunteer';
    tag = 'VOLUNTEER';
    themeColor = 'teal';
  }

  const capacity = evt.capacity || 50;
  const seatsLeft = Math.max(0, capacity - registrationsCount);

  return {
    id: evt.id,
    title: evt.title || 'Campus Event',
    category,
    badge,
    tag,
    themeColor,
    date: dateStr,
    time: timeStr,
    isoDate: evt.timestamp,
    location: 'Campus Hub',
    host: 'Hosted by campus community',
    organizer: 'Campus Organizer',
    organizerId: evt.organiser_id,
    organizerName: 'Campus Organizer',
    organizerEmail: 'organizer@campus.edu',
    capacity,
    registeredCount: registrationsCount,
    seatsLeft,
    isSoldOut: seatsLeft === 0,
    percentFilled: Math.min(100, Math.round((registrationsCount / capacity) * 100)),
    description: `Join us for ${evt.title}. Connect with peers, learn, and grow!`
  };
}

// ============================================================
// EXACT WORKSHOP SCHEMA OPERATIONS:
// 1. users: id (uuid), email (text), role (text)
// 2. events: id (uuid), organiser_id (uuid), title (text), capacity (int4), timestamp (timestamptz)
// 3. registrations: id (uuid), user_id (uuid), event_id (uuid), createdAt (timestamptz)
// ============================================================

/**
 * 1. GET /api/events - Browse events
 */
export async function dbGetEvents({ category, q, availableOnly }) {
  if (!isSupabaseConfigured() || !supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from('events')
    .select('id, organiser_id, title, capacity, timestamp, registrations(id)');

  if (error) {
    console.warn('⚠️ Supabase dbGetEvents error:', error.message);
    return null;
  }

  if (!data || data.length === 0) {
    return null; // Return null so server falls back to initial seed events if table is empty
  }

  let mapped = data.map((evt) => {
    const regCount = evt.registrations ? evt.registrations.length : 0;
    return enrichEventForUI(evt, regCount);
  });

  if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all events') {
    mapped = mapped.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    mapped = mapped.filter((e) => e.title.toLowerCase().includes(query));
  }

  if (availableOnly) {
    mapped = mapped.filter((e) => e.registeredCount < e.capacity);
  }

  return mapped;
}

/**
 * 2. GET /api/events/:id - Event Details
 */
export async function dbGetEventById(eventId) {
  if (!isSupabaseConfigured() || !supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from('events')
    .select('id, organiser_id, title, capacity, timestamp, registrations(id)')
    .eq('id', eventId)
    .maybeSingle();

  if (error || !data) return null;

  const regCount = data.registrations ? data.registrations.length : 0;
  return enrichEventForUI(data, regCount);
}

/**
 * 3. POST /api/registrations - Register user for an event (201 or 409)
 */
export async function dbRegisterUser({ eventId, name, email, age, phone, role }) {
  if (!isSupabaseConfigured() || !supabaseClient) return null;

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Fetch Event from Supabase
  const { data: event, error: eventErr } = await supabaseClient
    .from('events')
    .select('id, organiser_id, title, capacity, timestamp, registrations(id, user_id)')
    .eq('id', eventId)
    .maybeSingle();

  if (eventErr || !event) {
    // If not found in Supabase (e.g. initial demo event id 'evt_1'), return null for fallback
    return null;
  }

  // 2. Find or Create User in `users` table: only `email` and `role`
  let { data: user, error: userFindErr } = await supabaseClient
    .from('users')
    .select('id, email, role')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!user) {
    const { data: newUser, error: userCreateErr } = await supabaseClient
      .from('users')
      .insert({
        email: normalizedEmail,
        role: role?.toLowerCase().includes('organizer') ? 'organizer' : 'student'
      })
      .select('id, email, role')
      .single();

    if (userCreateErr) {
      console.warn('⚠️ Supabase user insert warning:', userCreateErr.message);
      // If RLS blocked, throw or fall back
      throw new Error(`Database permission: ${userCreateErr.message}`);
    }
    user = newUser;
  }

  // 3. Check for DUPLICATE REGISTRATION (HTTP 409 Conflict)
  const existingReg = (event.registrations || []).find((r) => r.user_id === user.id);
  if (existingReg) {
    const conflictErr = new Error(`A registration for "${normalizedEmail}" already exists for "${event.title}".`);
    conflictErr.status = 409;
    conflictErr.data = {
      error: 'Conflict',
      code: 'DUPLICATE_REGISTRATION',
      message: conflictErr.message,
      details: {
        registrationId: existingReg.id,
        userEmail: normalizedEmail
      }
    };
    throw conflictErr;
  }

  // 4. Check for CAPACITY LIMIT REACHED (HTTP 409 Conflict)
  const currentCount = event.registrations ? event.registrations.length : 0;
  if (currentCount >= event.capacity) {
    const fullErr = new Error(`Registration closed: "${event.title}" has reached its maximum capacity limit of ${event.capacity} attendees.`);
    fullErr.status = 409;
    fullErr.data = {
      error: 'Conflict',
      code: 'CAPACITY_REACHED',
      message: fullErr.message,
      capacity: event.capacity,
      registeredCount: currentCount
    };
    throw fullErr;
  }

  // 5. Insert into `registrations` table (HTTP 201 Created)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketCode = `CC-EVT-${randomSuffix}`;

  const { data: newReg, error: regInsertErr } = await supabaseClient
    .from('registrations')
    .insert({
      user_id: user.id,
      event_id: event.id,
      "createdAt": new Date().toISOString()
    })
    .select('id, user_id, event_id, "createdAt"')
    .single();

  if (regInsertErr) {
    console.warn('⚠️ Supabase registration insert error:', regInsertErr.message);
    throw new Error(`Failed to save registration to Supabase: ${regInsertErr.message}`);
  }

  return {
    id: newReg.id,
    eventId: event.id,
    name: name?.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: role || 'Student',
    ticketCode,
    qrData: `CAMPUS-CONNECT:${newReg.id}:${normalizedEmail}:${event.id}:${ticketCode}`,
    registeredAt: newReg.createdAt || new Date().toISOString(),
    checkedIn: false,
    status: 'CONFIRMED'
  };
}

/**
 * 4. GET /api/me/registrations - Current user's registrations
 */
export async function dbGetUserRegistrations(userEmail) {
  if (!isSupabaseConfigured() || !supabaseClient) return null;

  const normalizedEmail = userEmail.trim().toLowerCase();

  const { data: user } = await supabaseClient
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!user) return null;

  const { data: regs, error } = await supabaseClient
    .from('registrations')
    .select(`
      id,
      "createdAt",
      event:events(id, organiser_id, title, capacity, timestamp)
    `)
    .eq('user_id', user.id);

  if (error || !regs || regs.length === 0) return null;

  return regs.map((r) => ({
    id: r.id,
    eventId: r.event?.id,
    ticketCode: `CC-PASS-${r.id.substring(0, 4)}`,
    checkedIn: false,
    registeredAt: r.createdAt,
    event: enrichEventForUI(r.event || {})
  }));
}

/**
 * 5. GET /api/events/:id/registrations - Attendee list (Owning organizer only)
 */
export async function dbGetEventAttendees(eventId, { role, organizerId, email }) {
  if (!isSupabaseConfigured() || !supabaseClient) return null;

  const { data: event, error: eventErr } = await supabaseClient
    .from('events')
    .select('id, organiser_id, title, capacity, timestamp')
    .eq('id', eventId)
    .maybeSingle();

  if (eventErr || !event) return null;

  // Ownership check (supports both 'organizer' and 'organiser' spellings)
  const isOwner =
    (role === 'organizer' || role === 'organiser') &&
    (organizerId === event.organiser_id);

  if (!isOwner) {
    const forbiddenErr = new Error('Access Denied: The attendee list is restricted to the owning organizer of this event only.');
    forbiddenErr.status = 403;
    forbiddenErr.data = {
      error: 'Forbidden',
      code: 'ORGANIZER_ACCESS_ONLY',
      message: forbiddenErr.message,
      owningOrganizer: {
        id: event.organiser_id
      },
      currentRequester: {
        role,
        id: organizerId || 'anonymous'
      }
    };
    throw forbiddenErr;
  }

  const { data: attendees, error: attErr } = await supabaseClient
    .from('registrations')
    .select('id, "createdAt", user:users(id, email, role)')
    .eq('event_id', event.id);

  if (attErr) throw new Error(attErr.message);

  return {
    event: {
      id: event.id,
      title: event.title,
      capacity: event.capacity,
      registeredCount: attendees.length
    },
    owningOrganizer: {
      id: event.organiser_id
    },
    count: attendees.length,
    attendees: attendees.map((a) => ({
      id: a.id,
      ticketCode: `CC-ATT-${a.id.substring(0, 4)}`,
      name: a.user?.email.split('@')[0],
      email: a.user?.email,
      role: a.user?.role || 'Student',
      department: 'Campus Community',
      phone: 'N/A',
      age: 20,
      registeredAt: a.createdAt,
      checkedIn: false
    }))
  };
}
