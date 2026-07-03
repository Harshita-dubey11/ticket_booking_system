# Ticket Booking System

A ticket booking platform for movies and concerts. Seat maps, real-time holds, QR tickets, waitlist.

---

## Features

**Customers:**
- Browse and filter events (movies, concerts)
- Pick seats on a colour-coded live map
- Hold seats for a limited time, then confirm booking
- Get a QR code ticket via email
- View/cancel bookings, join waitlists for sold-out events

**Organisers:**
- Create events, upload posters, set per-category pricing
- See revenue and booking counts per event
- Manage all events from one dashboard

**Admins:**
- Create venues with custom dimensions
- Define seat categories (Premium, Standard, etc.)
- Auto-generate seats from grid layouts

---

## Tech Stack

| Part      | What                         |
|-----------|------------------------------|
| Backend   | Node.js + Express            |
| Frontend  | React 19 + Vite 8            |
| Database  | PostgreSQL (Neon)            |
| ORM       | Prisma                       |
| Auth      | JWT (bcryptjs + jsonwebtoken)|
| Realtime  | Socket.IO                    |
| QR        | qrcode                       |
| Email     | Nodemailer                   |
| Cron      | node-cron                    |
| UI        | Tailwind CSS + shadcn/ui     |

---

## Setup

Clone the repo, install deps:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in your database URL and JWT secret:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
JWT_SECRET="some-random-string"
PORT=3000
SEAT_HOLD_TTL_MINUTES=10
```

Push the schema and seed:

```bash
cd backend
npx prisma db push
node prisma/seed.js
```

Run both servers:

```bash
# backend (port 3000)
cd backend && npm run dev

# frontend (port 5173)
cd frontend && npm run dev
```

### Test accounts

| Email           | Password  | Role      |
|-----------------|-----------|-----------|
| admin@test.com  | admin123  | admin     |
| org@test.com    | org123    | organiser |
| cust@test.com   | cust123   | customer  |

---

## Environment variables

| Variable               | Default                          | Notes                              |
|------------------------|----------------------------------|-------------------------------------|
| DATABASE_URL           | _(required)_                     | PostgreSQL connection               |
| JWT_SECRET             | _(required)_                     | JWT signing key                     |
| JWT_EXPIRES_IN         | 7d                               | Token lifetime                      |
| PORT                   | 3000                             | Server port                         |
| SEAT_HOLD_TTL_MINUTES  | 10                               | How long a hold lasts               |
| EMAIL_HOST             | sandbox.smtp.mailtrap.io         | SMTP host                           |
| EMAIL_PORT             | 2525                             | SMTP port                           |
| EMAIL_USER             | _(optional)_                     | Leave empty to skip sending emails  |
| EMAIL_PASS             | _(optional)_                     |                                     |
| EMAIL_FROM             | noreply@ticketbook.com           | Sender address                      |
| FRONTEND_URL           | http://localhost:5173            | Used in waitlist offer links        |

Email is optional. If USER/PASS are missing, the system just logs a skip message and continues.

---

## API

All routes under `/api`. Protected routes need `Authorization: Bearer <token>`.

### Auth

```
POST   /api/auth/register     body: { name, email, password, role }
POST   /api/auth/login        body: { email, password }
GET    /api/auth/me
```

### Admin

```
GET    /api/admin/venues
POST   /api/admin/venues                        body: { name, rows, columns, address }
GET    /api/admin/venues/:id
PUT    /api/admin/venues/:id
DELETE /api/admin/venues/:id
POST   /api/admin/venues/:id/categories         body: { name, color, description }
PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id
POST   /api/admin/venues/:id/generate-seats
PUT    /api/admin/seats/:id                     body: { categoryId }
```

### Events

```
GET    /api/events               ?type=movie&search=avengers
GET    /api/events/my
GET    /api/events/:id
GET    /api/events/:id/seats
POST   /api/events               body: { title, type, venueId, date, duration, posterUrl? }
PUT    /api/events/:id
DELETE /api/events/:id
PUT    /api/events/:id/pricing   body: { prices: [{ categoryId, price }] }
GET    /api/events/:id/revenue
```

### Holds

```
POST   /api/holds                body: { eventId, showSeatIds }
DELETE /api/holds                body: { eventId, showSeatIds }
DELETE /api/holds/:showSeatId    body: { eventId }
GET    /api/holds
```

### Bookings

```
POST   /api/bookings             body: { eventId, showSeatIds }
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings/:id/cancel
```

### Waitlist

```
POST   /api/events/:id/waitlist  body: { categoryId }
GET    /api/waitlist
DELETE /api/waitlist/:id
```

### Upload

```
POST   /api/upload/poster        multipart, field: poster
```

---

## Database

10 tables:

```
users               id, name, email, password_hash, role, created_at
venues              id, name, address, rows, columns
seat_categories     id, venue_id, name, color, description
seats               id, venue_id, category_id, row_label, col_number, label
events              id, title, description, type, venue_id, date, duration, created_by, poster_url
event_pricings      id, event_id, category_id, price
show_seats          id, event_id, seat_id, status, held_by, held_at, held_until, booking_id
bookings            id, reference, user_id, event_id, total_amount, status, qr_code
booking_seats       id, booking_id, show_seat_id, price_at_time
waitlist            id, user_id, event_id, category_id, status, offered_at, offered_until
```

Status values:
- `show_seats.status`: available → held → booked
- `bookings.status`: pending → confirmed → cancelled
- `waitlist.status`: waiting → offered → expired / booked / cancelled

Relationships:

```
users ──┬── events (creator)
        ├── bookings
        ├── show_seats (held_by)
        └── waitlist

venues ──┬── seat_categories ─── seats
        │        │                 └── show_seats ─── booking_seats
        │        └── event_pricings                     └── bookings
        └── events
```

---

## How it works

### Seat holds

When a user holds seats, the backend runs `SELECT ... FOR UPDATE` on those `show_seats` rows inside a transaction. Sets status to `held` with a TTL. A cron job every 60 seconds releases any held seats past their TTL. Socket.IO broadcasts the change so everyone's seat map updates live.

### Booking

Booking also uses `FOR UPDATE` inside a transaction:
1. Locks and re-checks the held seats are still valid
2. Creates a booking record (starts as `pending`)
3. Marks seats as `booked`
4. Generates a QR code (base64 PNG)
5. Updates booking to `confirmed`
6. If any step fails, everything rolls back

### Waitlist

When someone cancels a booking:
1. The seat is released
2. The system finds the first person waiting for that event + category
3. Their waitlist entry becomes `offered` with a 30-min timer
4. The seat is held for them
5. They get an email with a link to claim it
6. If they don't claim it, the cron job expires the offer

---

## Deployment

### Backend on Render

Root dir: `backend`
Build: `npm install && npx prisma generate && npx prisma db push`
Start: `node src/index.js`

A `render.yaml` is in the repo for one-click blueprint setup.

### Frontend on Vercel

Root dir: `frontend`
Build: `npm run build`
Output: `dist`

Add `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

A `vercel.json` handles SPA routing.

### Live

| What     | URL |
|----------|-----|
| Frontend | [frontend-theta-two-59.vercel.app](https://frontend-theta-two-59.vercel.app) |
| Backend  | [ticket-booking-system-70lx.onrender.com](https://ticket-booking-system-70lx.onrender.com) |
| Repo     | [github.com/Harshita-dubey11/ticket_booking_system](https://github.com/Harshita-dubey11/ticket_booking_system) |
