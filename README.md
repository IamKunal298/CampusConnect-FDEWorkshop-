# Campus Pulse | Campus Event Manager Hub 🎓

An end-to-end, market-ready campus event management application built with **Tailwind CSS**, **Plus Jakarta Sans**, **Material Symbols Outlined**, **Node.js/Express**, and **Supabase (PostgreSQL)**.

Designed following modern production design principles, tactile minimalism, and strict REST API architecture with role-based security policies.

---

## 🌟 Interactive Pages & Modules

### 1. 🔍 Explore Events (`index.html`)
- **Live Metrics Cards:** Displays upcoming campus events, total available seats, and personal registered passes.
- **Sticky Filter Deck:** Instant keyword search (`⌘K`), campus venue dropdown, category pills (Tech & Hackathons, Workshops & Labs, Career & Networking, Arts & Music, Sports & Rec), and open-seat filters.
- **Dynamic Events Grid:** Renders all 19 events directly from the live Supabase PostgreSQL database with cover imagery, date badges, category tags, and live seat progress bars.
- **Fast-Lane Quick RSVP Drawer:** Slide-out drawer with one-click reservation and instant digital pass issuance.

### 2. 📋 Event Details & Registration (`event-details.html`)
- **Hero & Status Strip:** High-resolution campus photography, date & schedule breakdown, venue, and live capacity meters.
- **Session Agenda & Missions:** Track milestones, speaker lineups, verified certificate info, and catering details.
- **One-Click RSVP Engine (`POST /api/registrations`):**
  - **`201 Created`:** Confirms spot, issues unique ticket code (`#CC-PASS-...`), generates vector QR pass, and dispatches credentials.
  - **`409 Conflict`:** Detects duplicate enrollments and displays amber conflict alerts with ticket lookup.
  - **`400 Bad Request`:** Enforces capacity limits and prevents overbooking.
- **Calendar Integration:** One-click `.ics` export for Google Calendar, Apple Calendar, and Outlook.
- **Organizer Contact Modal:** Directly message event organizers for accommodations and questions.

### 3. 🎫 Student Wallet & Digital Passes (`my-registrations.html`)
- **Pass Status Tabs:** Filter passes by `Upcoming`, `Checked In`, and `Waitlisted`.
- **Dynamic Vector QR Code:** Mathematically rendered on each pass for seamless gate verification.
- **Fullscreen Digital Pass Modal:** High-resolution scannable ticket with attendee dossier and Print / PDF export.
- **Mobile Wallet Export:** Downloadable ticket pass credentials.
- **RSVP Cancellation:** Cancels pass and immediately releases the reserved seat back into the public pool.

### 4. 🛡️ Organizer Hub & Check-In Station (`organizer-hub.html`)
- **Authorized Context:** Strict security enforcement verifying the requester is the owning organizer (`role === 'organiser'`). Unauthorized students receive **`403 Forbidden`**.
- **Event Switcher Dropdown:** Dynamically switch between all events in the database to inspect attendee rosters.
- **Circular Capacity Gauge:** Circular SVG gauge tracking real-time registration against fire-marshal limits.
- **Live Attendee Roster Table:** Search attendees, filter by `Checked In` vs `Pending`, and toggle check-in status (`PATCH /api/events/:id/registrations/:regId/checkin`) with immediate badge updates.
- **Fast-Lane QR Scanner Modal:** Optical camera scanner simulation and manual student ID search.
- **Broadcast Notice Modal:** Compose announcements and dispatch push notifications to attendees.
- **CSV Export:** Download full attendee roster with registration timestamps.

---

## 🏗️ Architecture & Database

```
┌────────────────────────────────────────────────────────┐
│     4-Screen Frontend (Tailwind + Plus Jakarta Sans)   │
│  - index.html (Explore Events)                         │
│  - event-details.html (Details & RSVP)                 │
│  - my-registrations.html (Passes & QR)                 │
│  - organizer-hub.html (Roster & Scanner)               │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (api.js)
┌───────────────────────────▼────────────────────────────┐
│         Express 5 Backend Server (server.js)           │
│                    Port 5000                           │
└───────────────────────────┬────────────────────────────┘
                            │ Supabase SDK
┌───────────────────────────▼────────────────────────────┐
│            Supabase Cloud Database                     │
│               (PostgreSQL Schema)                      │
│   • public.users (id, email, role)                     │
│   • public.events (id, organiser_id, title, capacity)  │
│   • public.registrations (id, user_id, event_id)       │
└────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/status` | System health & Supabase connection status | `200 OK` |
| `GET` | `/api/events` | Browse all campus events with search & filters | `200 OK` |
| `GET` | `/api/events/:id` | Event details, capacity & schedule | `200 OK`, `404 Not Found` |
| `POST` | `/api/registrations` | Register user for an event | `201 Created`, `409 Conflict` |
| `GET` | `/api/me/registrations` | Fetch logged-in student's active passes | `200 OK` |
| `DELETE` | `/api/registrations/:id` | Cancel registration and release seat | `200 OK`, `404 Not Found` |
| `GET` | `/api/events/:id/registrations` | Attendee list (**Owning Organizer Only**) | `200 OK`, `403 Forbidden` |
| `PATCH` | `/api/events/:id/registrations/:regId/checkin` | Toggle attendee check-in status | `200 OK`, `403 Forbidden` |
| `POST` | `/api/broadcast` | Dispatch broadcast notice to attendees | `200 OK` |

---

## 🚀 How to Run the Application

### Option 1: Full-Stack Mode (Recommended)

1. Make sure Node.js dependencies are installed:
   ```bash
   npm install
   ```

2. Start the Express backend:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   - **Explore Events:** [http://localhost:5000](http://localhost:5000)
   - **Event Details:** [http://localhost:5000/event-details.html](http://localhost:5000/event-details.html)
   - **My Passes:** [http://localhost:5000/my-registrations.html](http://localhost:5000/my-registrations.html)
   - **Organizer Hub:** [http://localhost:5000/organizer-hub.html](http://localhost:5000/organizer-hub.html)

---

### Option 2: Using VS Code / Antigravity IDE "Live Server"

1. Ensure `node server.js` is running in your terminal on port 5000.
2. In VS Code or Antigravity IDE:
   - Right-click `index.html` (or `event-details.html`, `my-registrations.html`, `organizer-hub.html`).
   - Click **"Open with Live Server"**.
3. The page opens at `http://127.0.0.1:5500` (or `5502`).
4. `js/api.js` automatically detects that you are on Live Server and routes all API requests directly to `http://localhost:5000` with zero configuration needed!

---

## 🧪 Running Automated Tests

To run the complete automated test suite verifying all 15 endpoints, Supabase operations, and error codes:

```bash
node test_app.js
```

**Test Output:**
```
🧪 Starting Campus Pulse Test Suite...

  ✅ PASS: GET /api/status returns online and Supabase PostgreSQL
  ✅ PASS: GET /api/events returns 19 events directly from Supabase
  ✅ PASS: GET /api/events/:id returns complete event details
  ✅ PASS: POST /api/registrations succeeds with 201 Created
  ✅ PASS: POST /api/registrations with duplicate email returns 409 Conflict
  ✅ PASS: GET /api/me/registrations retrieves newly created pass
  ✅ PASS: GET /api/events/:id/registrations returns 403 Forbidden for Student
  ✅ PASS: GET /api/events/:id/registrations returns 200 OK for Owning Organizer
  ✅ PASS: PATCH /api/events/:id/registrations/:regId/checkin toggles checkin status
  ✅ PASS: POST /api/broadcast dispatches announcements
  ✅ PASS: DELETE /api/registrations/:id cancels registration and releases seat
  ✅ PASS: Static Page: GET / serves index.html (Explore Events)
  ✅ PASS: Static Page: GET /event-details.html serves Event Details page
  ✅ PASS: Static Page: GET /my-registrations.html serves My Passes page
  ✅ PASS: Static Page: GET /organizer-hub.html serves Organizer Hub page

🏁 Test Suite Finished: 15 passed, 0 failed.
```

---

## 🌐 Deploy to Production (Render / Vercel / Railway)

### Deploying on Render:
1. Connect your GitHub repository: `https://github.com/IamKunal298/CampusConnect-FDEWorkshop-`
2. Create a new **Web Service**.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. In Environment Variables, add:
   - `SUPABASE_URL`: `https://kzundprnmdcdmjvdbnyt.supabase.co`
   - `SUPABASE_KEY`: `<your_supabase_anon_key>`
6. Click **Deploy Web Service**. Your app is live!
