-- ============================================================
-- CAMPUS CONNECT — SUPABASE POSTGRESQL SCHEMA
-- Matches the exact schema design from the workshop:
--   1. users (id, email, role)
--   2. events (id, organiser_id, title, capacity, timestamp)
--   3. registrations (id, user_id, event_id, createdAt)
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'student',
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    capacity INT4 NOT NULL DEFAULT 50,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 days'),
    -- Extended metadata for vibrant UI presentation
    category TEXT DEFAULT 'Workshops',
    badge TEXT DEFAULT 'DT',
    tag TEXT DEFAULT 'WORKSHOP',
    location TEXT DEFAULT 'Campus Innovation Hub',
    description TEXT DEFAULT 'Campus event workshop and gathering.'
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ticket_code TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    -- Prevent duplicate registrations at the database level!
    CONSTRAINT unique_user_event_registration UNIQUE (user_id, event_id)
);

-- ============================================================
-- SEED DATA (Demo Users, Events & Initial Registrations)
-- Run this once to populate initial demo data
-- ============================================================

-- Insert Demo Users (1 Organizer, 1 Student)
INSERT INTO users (id, email, role, name)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'elena.rostova@campus.edu', 'organizer', 'Elena Rostova'),
    ('00000000-0000-0000-0000-000000000002', 'karan.gupta@campus.edu', 'student', 'Karan Gupta'),
    ('00000000-0000-0000-0000-000000000003', 'marcus.vance@campus.edu', 'organizer', 'Marcus Vance')
ON CONFLICT (email) DO NOTHING;

-- Insert Events
INSERT INTO events (id, organiser_id, title, capacity, timestamp, category, badge, tag, location, description)
VALUES 
    (
        '11111111-1111-1111-1111-111111111101', 
        '00000000-0000-0000-0000-000000000001', 
        'Design Thinking Lab', 
        35, 
        NOW() + INTERVAL '2 days',
        'Workshops',
        'DT',
        'WORKSHOP',
        'Innovation Hub • Room 204',
        'Immerse yourself in human-centered design sprints! Learn wireframing, rapid user testing, and interactive prototyping.'
    ),
    (
        '11111111-1111-1111-1111-111111111102', 
        '00000000-0000-0000-0000-000000000003', 
        'Campus Connect Mixer', 
        120, 
        NOW() + INTERVAL '4 days',
        'Social',
        'CC',
        'COMMUNITY',
        'Student Commons',
        'The ultimate semester networking mixer! Break the ice with club leaders, find study partners, and vibe with food trucks.'
    ),
    (
        '11111111-1111-1111-1111-111111111103', 
        '00000000-0000-0000-0000-000000000001', 
        'Careers in AI & Tech', 
        150, 
        NOW() + INTERVAL '6 days',
        'Career',
        'AI',
        'CAREER',
        'Auditorium B',
        'Direct conversations with alumni engineers and AI research scientists from top tech hubs. Resume reviews & hiring tips.'
    ),
    (
        '11111111-1111-1111-1111-111111111104', 
        '00000000-0000-0000-0000-000000000003', 
        'Open Mic Evening', 
        80, 
        NOW() + INTERVAL '8 days',
        'Culture',
        '♫',
        'CULTURE',
        'Campus Amphitheatre',
        'Poetry, acoustic guitars, stand-up comedy, and soulful covers. Grab a warm cider and cheer on your campus friends!'
    ),
    (
        '11111111-1111-1111-1111-111111111105', 
        '00000000-0000-0000-0000-000000000001', 
        'Inter-college Badminton', 
        32, 
        NOW() + INTERVAL '10 days',
        'Sports',
        '↗',
        'SPORTS',
        'Sports Complex',
        'Singles and doubles knockout tournament! High adrenaline rallies, trophies for top 3, energy refreshments.'
    ),
    (
        '11111111-1111-1111-1111-111111111106', 
        '00000000-0000-0000-0000-000000000001', 
        'Community Care Day', 
        2, -- Small capacity (2) to demonstrate HTTP 409 Capacity Full easily!
        NOW() + INTERVAL '12 days',
        'Volunteer',
        '♡',
        'VOLUNTEER',
        'Main Gate • Meet-up',
        'Urban forestry planting, campus eco-clean drive, and local food shelter packaging. Give back and earn volunteer credits.'
    )
ON CONFLICT (id) DO NOTHING;

-- Seed initial registration for Karan Gupta on event 2
INSERT INTO registrations (id, user_id, event_id, "createdAt", ticket_code, checked_in)
VALUES (
    '22222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111102',
    NOW() - INTERVAL '1 day',
    'CC-CC-1001',
    FALSE
)
ON CONFLICT (user_id, event_id) DO NOTHING;
