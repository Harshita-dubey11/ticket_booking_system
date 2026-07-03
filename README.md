# Ticket Booking System

A full-stack ticket booking platform for movies and concerts with visual seat maps, real-time availability, seat hold TTL, atomic booking transactions, QR-code ticket delivery, and FIFO waitlist auto-assignment.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%2B-6DA55F?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io" alt="Socket.IO">
</p>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Roles & Access](#roles--access)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [System Design](#system-design)
- [Deployment](#deployment)
- [Live URLs](#live-urls)

---

## Features

### For Customers
- **Browse Events** — filter movies/concerts, search by title
- **Visual Seat Map** — real-time colour-coded seat grid with category overlays
- **Seat Holds** — reserve seats with configurable TTL, release before booking
- **Atomic Booking** — verified hold → payment → QR ticket in one transaction
- **QR Code Tickets** — base64 PNG delivered via email as inline attachment
- **Booking History** — view, cancel, and re-download QR codes
- **Waitlist** — join per-category queues; auto-assigned seats on cancellations

### For Organisers
- **Event Management** — create/update/delete events with venue selection
- **Poster Upload** — upload event poster images or paste URLs
- **Per-Category Pricing** — set ticket prices by seat category
- **Revenue Dashboard** — total revenue, booking counts, recent transactions
- **My Events Hub** — manage all events with inline pricing and revenue panels

### For Admins
- **Venue CRUD** — create venues with custom row × column layouts
- **Seat Categories** — define categories with colour coding (Premium, Standard, etc.)
- **Auto-Seat Generation** — distribute seats across categories from grid dimensions
- **Full Access** — view all events, bookings, and waitlists

---

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Backend      | Node.js + Express (JavaScript)                  |
| Frontend     | React 19 + Vite 8 (JavaScript)                  |
| Database     | PostgreSQL via [Neon](https://neon.tech)        |
| ORM          | Prisma 5 (schema-first, migrations)             |
| Auth         | JWT (bcryptjs + jsonwebtoken)                   |
| Real-time    | Socket.IO (WebSocket with room channels)        |
| Validation   | Zod (request schema validation)                 |
| QR Code      | qrcode (PNG → base64)                           |
| Email        | Nodemailer (configurable SMTP, Mailtrap for dev)|
| Scheduling   | node-cron (every 60s for TTL expiry)            |
| UI           | Tailwind CSS v3 + shadcn/ui components          |

---

## Project Structure

```
ticket-booking-system/
├── backend/
│   ├── src/
│   │   ├── config/             # env, cors, database config
│   │   ├── controllers/        # request handlers (auth, venues, events, bookings, holds, waitlist)
│   │   ├── middleware/          # JWT authentication, role authorization, error handler
│   │   ├── routes/             # Express route definitions (auth, admin, events, holds, bookings, waitlist, upload)
│   │   ├── services/           # email, QR code, Socket.IO
│   │   ├── utils/              # Prisma client, custom errors, async handler wrapper
│   │   └── index.js            # server entry point, cron jobs, Socket.IO init
│   ├── prisma/
│   │   ├── schema.prisma       # 10 models with relations and constraints
│   │   └── seed.js             # test users, venue, categories, seats, sample events
│   ├── uploads/                # uploaded poster images (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # SeatMap, Navbar, UI kit (shadcn), ProtectedRoute, ErrorBoundary
│   │   ├── pages/              # 14 pages (Home, Events, EventDetail, Checkout, MyEvents, Admin, Organiser, etc.)
│   │   ├── context/            # AuthContext (JWT state management)
│   │   ├── services/           # API client (fetch wrapper), Socket.IO client
│   │   ├── index.css           # Tailwind directives + custom component styles
│   │   └── App.jsx             # router with role-based ProtectedRoute guards
│   ├── .env.production         # production VITE_API_URL
│   ├── vercel.json             # SPA rewrite rules
│   └── package.json
├── system-design.md            # architecture document (≤800 words)
├── render.yaml                 # Render deployment blueprint
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL database (local or free [Neon](https://neon.tech) serverless)

### 1. Clone & Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Setup

Copy and configure the backend environment:

```bash
cp backend/.env.example backend/.env
```

### 3. Database Setup

```bash
cd backend
npx prisma db push
node prisma/seed.js
```

### 4. Run Locally

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Seeded Test Accounts

| Email              | Password  | Role      |
| ------------------ | --------- | --------- |
| admin@test.com     | admin123  | Admin     |
| org@test.com       | org123    | Organiser |
| cust@test.com      | cust123   | Customer  |

---

## Environment Variables

| Variable               | Default                          | Description                                   |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| `DATABASE_URL`         | _(required)_                     | PostgreSQL connection string                   |
| `JWT_SECRET`           | _(required)_                     | Secret key for JWT signing                     |
| `JWT_EXPIRES_IN`       | `7d`                             | JWT token expiration duration                  |
| `PORT`                 | `3000`                           | Backend server port                            |
| `SEAT_HOLD_TTL_MINUTES`| `10`                             | Seat hold expiry time in minutes               |
| `EMAIL_HOST`           | `sandbox.smtp.mailtrap.io`       | SMTP host for transactional emails             |
| `EMAIL_PORT`           | `2525`                           | SMTP port                                      |
| `EMAIL_USER`           | _(optional)_                     | SMTP username (skip to disable email sending)  |
| `EMAIL_PASS`           | _(optional)_                     | SMTP password                                  |
| `EMAIL_FROM`           | `noreply@ticketbook.com`         | Sender email address                           |
| `FRONTEND_URL`         | `http://localhost:5173`          | Frontend URL (used in email claim links)       |
| `VITE_API_URL`         | `http://localhost:3000/api`      | Backend API URL (frontend build-time variable) |

> **Email is optional** — if `EMAIL_USER`/`EMAIL_PASS` are not set, email sending is skipped gracefully with a console log. All other functionality (booking, QR generation) works without email.

---

## Roles & Access

| Page                      | Customer | Organiser | Admin |
| ------------------------- | :------: | :-------: | :---: |
| Browse Events             | ✓        | ✓         | ✓     |
| Event Detail / Seat Map   | ✓        | ✓         | ✓     |
| Hold Seats                | ✓        | ✓         | ✓     |
| Book Tickets              | ✓        | ✓         | ✓     |
| Booking History           | ✓        | ✓         | ✓     |
| My Waitlist               | ✓        | ✓         | ✓     |
| My Events Hub             | —        | ✓         | ✓     |
| Create Event              | —        | ✓         | ✓     |
| Set Pricing               | —        | ✓         | ✓     |
| Revenue Dashboard         | —        | ✓         | ✓     |
| Admin Dashboard           | —        | —         | ✓     |
| Manage Venues             | —        | —         | ✓     |
| Seat Category Management  | —        | —         | ✓     |

> Pages are protected via `<ProtectedRoute>` — unauthorized users are redirected to login or home.

---

## API Reference

All endpoints are prefixed with `/api`. Authenticated routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Path               | Auth | Description                |
|--------|--------------------|------|----------------------------|
| POST   | /api/auth/register | —    | Register (name, email, password, role) |
| POST   | /api/auth/login    | —    | Login, returns JWT + user  |
| GET    | /api/auth/me       | ✓    | Current user profile       |

### Admin

| Method | Path                                    | Description                    |
|--------|-----------------------------------------|--------------------------------|
| GET    | /api/admin/venues                       | List all venues                |
| POST   | /api/admin/venues                       | Create venue (name, rows, columns, address) |
| GET    | /api/admin/venues/:id                   | Venue details with seats       |
| PUT    | /api/admin/venues/:id                   | Update venue                   |
| DELETE | /api/admin/venues/:id                   | Delete venue (cascades)        |
| POST   | /api/admin/venues/:id/categories        | Add seat category (name, color, description) |
| PUT    | /api/admin/categories/:id               | Update category                |
| DELETE | /api/admin/categories/:id               | Delete category                |
| POST   | /api/admin/venues/:id/generate-seats    | Auto-generate seats across categories |
| PUT    | /api/admin/seats/:id                    | Change a seat's category       |

### Events

| Method | Path                    | Auth      | Description                          |
|--------|-------------------------|-----------|--------------------------------------|
| GET    | /api/events             | —         | Browse events (`?type=movie&search=avengers`) |
| GET    | /api/events/my          | organiser | Organiser's own events               |
| GET    | /api/events/:id         | —         | Event details with venue & pricing   |
| GET    | /api/events/:id/seats   | —         | Seat grid with live status per seat  |
| POST   | /api/events             | organiser | Create event (auto-generates ShowSeats) |
| PUT    | /api/events/:id         | owner     | Update event details                 |
| DELETE | /api/events/:id         | owner     | Delete event                         |
| PUT    | /api/events/:id/pricing | organiser | Set per-category pricing array       |
| GET    | /api/events/:id/revenue | organiser | Booking summary + revenue + bookings |

### Holds

| Method | Path                    | Auth | Description                                   |
|--------|-------------------------|------|-----------------------------------------------|
| POST   | /api/holds              | ✓    | Hold seats (`{eventId, showSeatIds}`) — uses `SELECT ... FOR UPDATE` |
| DELETE | /api/holds              | ✓    | Release held seats (`{eventId, showSeatIds}`) |
| DELETE | /api/holds/:showSeatId  | ✓    | Release a single held seat                   |
| GET    | /api/holds              | ✓    | List current user's active holds             |

### Bookings

| Method | Path                    | Auth | Description                      |
|--------|-------------------------|------|----------------------------------|
| POST   | /api/bookings           | ✓    | Confirm booking (atomic transaction, QR generation) |
| GET    | /api/bookings           | ✓    | Booking history                  |
| GET    | /api/bookings/:id       | ✓    | Single booking detail            |
| POST   | /api/bookings/:id/cancel| ✓    | Cancel booking, triggers waitlist auto-assignment |

### Waitlist

| Method | Path                           | Auth | Description                    |
|--------|--------------------------------|------|--------------------------------|
| POST   | /api/events/:id/waitlist       | ✓    | Join waitlist for a category   |
| GET    | /api/waitlist                  | ✓    | My waitlist entries with status |
| DELETE | /api/waitlist/:id              | ✓    | Leave waitlist                 |

### Upload

| Method | Path               | Auth      | Description                      |
|--------|--------------------|-----------|----------------------------------|
| POST   | /api/upload/poster | organiser | Upload event poster (multipart)  |

---

## Database Schema

```
users ──────────┬── events (creator) ────────┬── event_pricings
│               │    │  ▲                     │    └── category
│               │    │  │ venue               ├── show_seats
│               │    │  │   ▲                 │    ├── seat
│               │    │  │   │ seat_categories │    │   └── category
│               │    │  │   │  └── seats      │    ├── booking
│               │    │  │   │                  │    │   ├── user
│               │    │  │   │                  │    │   └── booking_seats
│               │    │  │   │                  │    └── heldBy (user)
│               │    │  └── venue             │
│               ├── bookings ────────────────┤
│               ├── heldSeats (show_seats)    │
│               └── waitlist ─────────────────┴── category
```

### Entity Details

| Table            | Key Columns                                          |
| ---------------- | ---------------------------------------------------- |
| `users`          | id, name, email, password_hash, role, created_at     |
| `venues`         | id, name, address, rows, columns                     |
| `seat_categories`| id, venue_id, name, color, description               |
| `seats`          | id, venue_id, category_id, row_label, col_number, label |
| `events`         | id, title, description, type, venue_id, date, duration, created_by, poster_url |
| `event_pricings` | id, event_id, category_id, price (DECIMAL 10,2)      |
| `show_seats`     | id, event_id, seat_id, status, held_by, held_at, held_until, booking_id |
| `bookings`       | id, reference (UNIQUE), user_id, event_id, total_amount, status, qr_code |
| `booking_seats`  | id, booking_id, show_seat_id (UNIQUE), price_at_time |
| `waitlist`       | id, user_id, event_id, category_id, status, offered_at, offered_until |

**Status enums:**
- `show_seats.status`: `available` → `held` → `booked`
- `bookings.status`: `pending` → `confirmed` → `cancelled`
- `waitlist.status`: `waiting` → `offered` → `expired` / `booked` / `cancelled`

---

## System Design

### Concurrency Control
PostgreSQL `SELECT ... FOR UPDATE` row-level locks inside Prisma `$transaction` prevent race conditions on seat holds and bookings. Two users cannot simultaneously hold or book the same seat — the second transaction sees the updated row and receives a 409 Conflict.

### Seat Hold TTL
Held seats have a configurable TTL (`SEAT_HOLD_TTL_MINUTES`, default 10 min). A `node-cron` job runs every 60s:
```sql
UPDATE show_seats SET status='available', held_by=NULL, held_until=NULL
WHERE status='held' AND held_until < NOW()
```
Released seats broadcast `seat:updated` via Socket.IO to all connected clients in real time.

### Atomic Booking Flow
```
1. SELECT show_seats FOR UPDATE (verify held by user, not expired)
2. Calculate total from EventPricing
3. Create Booking (status: pending)
4. Update ShowSeats (status: booked, link booking_id)
5. Upsert BookingSeats (price captured at booking time)
6. Generate QR code (PNG → base64)
7. Update Booking (status: confirmed, qr_code)
8. Emit socket event
```
All steps run in a single transaction — any failure rolls back everything.

### Waitlist Auto-Assignment
FIFO queue per `(event_id, category_id)` ordered by `created_at`. On cancellation:
1. Old BookingSeat records deleted
2. Seat released (status → available)
3. First `waiting` entry found for same event + category
4. Status → `offered` with 30-min TTL, seat held for that user
5. Email sent with time-limited claim link
6. Cron expires stale offers without cascading — next cancellation triggers the next offer

### Real-Time Updates
Socket.IO room channels (`event:<eventId>`). Clients join on page load, receive `seat:updated` events for any status change (hold, release, book, cancel, cron expiry). Zero-polling architecture.

---

## Deployment

### Backend — Render

| Setting          | Value                                         |
| ---------------- | --------------------------------------------- |
| Root Directory   | `backend`                                     |
| Build Command    | `npm install && npx prisma generate && npx prisma db push` |
| Start Command    | `node src/index.js`                           |
| Runtime          | Node                                          |

Add the environment variables listed above in Render's dashboard. A `render.yaml` blueprint is included in the repo root for one-click setup.

### Frontend — Vercel

| Setting          | Value                                         |
| ---------------- | --------------------------------------------- |
| Root Directory   | `frontend`                                    |
| Build Command    | `npm run build`                               |
| Output Directory | `dist`                                        |
| Framework        | Vite (auto-detected)                          |

Create `.env.production` in `frontend/` with:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

A `vercel.json` is included for SPA routing. The backend URL must be set as a non-sensitive build-time variable.

### Database
The project uses **Neon** serverless PostgreSQL. No additional setup needed — the `DATABASE_URL` connection string handles everything. The free tier includes 0.5 GB storage, sufficient for development and small productions.

---

## Live URLs

| Service  | URL                                                              |
| -------- | ---------------------------------------------------------------- |
| Frontend | [frontend-theta-two-59.vercel.app](https://frontend-theta-two-59.vercel.app) |
| Backend  | [ticket-booking-system-70lx.onrender.com](https://ticket-booking-system-70lx.onrender.com) |
| GitHub   | [github.com/Harshita-dubey11/ticket_booking_system](https://github.com/Harshita-dubey11/ticket_booking_system) |

---

## License

MIT — built as an academic/demo project.
