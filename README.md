# Campus Connect 🎓

An end-to-end fullstack campus event management application built with **React 19**, **Tailwind CSS**, **Node.js/Express**, and **Supabase (PostgreSQL)**.

Developed as part of the college production design & development workshop, following modern API architecture and relational database normalization standards.

---

## 🌟 Features

- **Events Discovery Hub (`GET /api/events`):** Real-time search, category filters (Workshops, Social, Career, Sports, Culture, Volunteer), live capacity trackers, and status tags.
- **Detailed Event View (`GET /api/events/:id`):** Agendas with timestamps, speaker lineups, student perks, and remaining seat meters.
- **Event Registration (`POST /api/registrations`):**
  - **`201 Created`:** Dynamic ticket code (e.g. `CC-DT-4819`), scannable gate QR code, and `.ics` calendar download.
  - **`409 Conflict`:** Automatic handling for duplicate registrations and sold-out capacity limits.
- **Student Wallet (`GET /api/me/registrations`):** Personalized digital pass hub with verification QR passes for entry.
- **Organizer Management Portal (`GET /api/events/:id/registrations`):**
  - **`403 Forbidden`** security enforcement for unauthorized students.
  - **`200 OK`** attendee roster with gate check-in toggles and CSV export for owning organizers.
- **Live API Inspector:** Built-in floating console displaying real-time HTTP requests, latency, headers, and JSON payloads.
- **Cloud Database (Supabase PostgreSQL):** Integrated database service layer with automatic fallback to resilient local storage if offline.

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│     React 19 Frontend (Vite)    │
│   (Port 5000 / Live Server)     │
└──────────────┬──────────────────┘
               │ HTTP / JSON
┌──────────────▼──────────────────┐
│    Express 5 Backend Server     │
│       (server.js @ :5000)       │
└──────────────┬──────────────────┘
               │ Supabase SDK
┌──────────────▼──────────────────┐
│     Supabase Cloud Database     │
│       (PostgreSQL Schema)       │
│  - users                        │
│  - events                       │
│  - registrations                │
└─────────────────────────────────┘
```

---

## 🗄️ Database Schema (Supabase)

The database schema matches the relational model from the workshop:

1. **`users` Table:**
   - `id` (UUID, Primary Key)
   - `email` (TEXT, Unique)
   - `role` (TEXT, 'student' | 'organizer')

2. **`events` Table:**
   - `id` (UUID, Primary Key)
   - `organiser_id` (UUID, Foreign Key -> `users.id`)
   - `title` (TEXT)
   - `capacity` (INT4)
   - `timestamp` (TIMESTAMPTZ)

3. **`registrations` Table:**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key -> `users.id`)
   - `event_id` (UUID, Foreign Key -> `events.id`)
   - `createdAt` (TIMESTAMPTZ)

---

## 📡 REST API Specification

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/events` | Browse all campus events (with search & filters) | `200 OK` |
| `GET` | `/api/events/:id` | Event details, agenda & remaining seat counts | `200 OK`, `404 Not Found` |
| `POST` | `/api/registrations` | Register user for an event | `201 Created`, `409 Conflict` (Duplicate/Full) |
| `GET` | `/api/me/registrations` | Fetch logged-in user's active passes | `200 OK` |
| `GET` | `/api/events/:id/registrations` | Attendee list (**Owning Organizer Only**) | `200 OK`, `403 Forbidden` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Git

### 2. Installation
```bash
git clone <your-repo-url>
cd campus-connect
npm install
```

### 3. Environment Variables (Optional for Supabase Cloud)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```
*(If no Supabase keys are provided, the app automatically runs in Local Memory Mode).*

### 4. Run the Application
```bash
# Build the frontend bundle
npm run build

# Start the fullstack server
node server.js
```
Open **`http://localhost:5000`** in your browser.

---

## 🌐 Deploy to the Cloud (Free Hosting Options)

### Option A: Render (Recommended for Fullstack Express + React)
1. Push this repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
6. Under **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_KEY`: Your Supabase API Key
7. Click **Deploy Web Service** — Render will give you a live URL (`https://campus-connect.onrender.com`).

### Option B: Railway
1. Sign in to [Railway](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Add `SUPABASE_URL` and `SUPABASE_KEY` under the Variables tab.
4. Railway will automatically detect `package.json` and deploy.
