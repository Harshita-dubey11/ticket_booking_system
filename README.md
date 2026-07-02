# Ticket Booking System

A full-stack ticket booking platform for movies and concerts with visual seat selection, real-time seat holds, waitlist auto-assignment, and QR-code email delivery.

---

## Tech Stack

- **Backend:** Node.js + Express (JavaScript)
- **Frontend:** React + Vite (JavaScript)
- **Database:** PostgreSQL (via Prisma ORM)
- **Real-time:** Socket.IO
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Zod
- **QR Code:** qrcode
- **Email:** Nodemailer
- **Cron:** node-cron

---

## Setup Guide

### Prerequisites

- Node.js >= 18
- PostgreSQL database (local or [Neon](https://neon.tech) serverless)

### 1. Clone and install

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure environment

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
SEAT_HOLD_TTL_MINUTES=10
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-email-user"
EMAIL_PASS="your-email-pass"
EMAIL_FROM="noreply@ticketbook.com"
FRONTEND_URL="http://localhost:5173"
```

### 3. Push database schema and seed

```bash
cd backend
npx prisma db push
node prisma/seed.js
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Test accounts (seeded)

| Email           | Password  | Role      |
|-----------------|-----------|-----------|
| admin@test.com  | admin123  | admin     |
| org@test.com    | org123    | organiser |
| cust@test.com   | cust123   | customer  |

---

## API Documentation

### Auth

| Method | Path              | Auth  | Description          |
|--------|-------------------|-------|----------------------|
| POST   | /api/auth/register| -     | Register user        |
| POST   | /api/auth/login   | -     | Login, returns JWT   |
| GET    | /api/auth/me      | JWT   | Current user profile |

### Admin (role: admin)

| Method | Path                                    | Description                    |
|--------|-----------------------------------------|--------------------------------|
| GET    | /api/admin/venues                       | List all venues                |
| POST   | /api/admin/venues                       | Create venue                   |
| GET    | /api/admin/venues/:id                   | Venue details + seats          |
| PUT    | /api/admin/venues/:id                   | Update venue                   |
| DELETE | /api/admin/venues/:id                   | Delete venue                   |
| POST   | /api/admin/venues/:id/categories        | Add seat category              |
| PUT    | /api/admin/categories/:id               | Update category                |
| DELETE | /api/admin/categories/:id               | Delete category                |
| POST   | /api/admin/venues/:id/generate-seats    | Auto-generate seats from grid  |
| PUT    | /api/admin/seats/:id                    | Change seat category           |

### Events

| Method | Path                    | Auth      | Description                 |
|--------|-------------------------|-----------|-----------------------------|
| GET    | /api/events             | -         | Browse (filter: type,search)|
| GET    | /api/events/my          | organiser | My events                   |
| GET    | /api/events/:id         | -         | Event details               |
| GET    | /api/events/:id/seats   | -         | Seat map with live status   |
| POST   | /api/events             | organiser | Create event                |
| PUT    | /api/events/:id         | owner     | Update event                |
| DELETE | /api/events/:id         | owner     | Delete event                |
| PUT    | /api/events/:id/pricing | organiser | Set per-category pricing    |
| GET    | /api/events/:id/revenue | organiser | Booking summary + revenue   |

### Seat Holds

| Method | Path              | Auth     | Description                           |
|--------|-------------------|----------|---------------------------------------|
| POST   | /api/holds        | customer | Hold seats (SELECT FOR UPDATE)        |
| DELETE | /api/holds        | customer | Release held seats                    |
| GET    | /api/holds        | customer | List my active holds                  |

### Bookings

| Method | Path                      | Auth     | Description               |
|--------|---------------------------|----------|---------------------------|
| POST   | /api/bookings             | customer | Confirm booking (atomic)  |
| GET    | /api/bookings             | customer | Booking history           |
| GET    | /api/bookings/:id         | customer | Booking details + QR      |
| POST   | /api/bookings/:id/cancel  | customer | Cancel + trigger waitlist |

### Waitlist

| Method | Path                           | Auth     | Description              |
|--------|--------------------------------|----------|--------------------------|
| POST   | /api/waitlist/events/:id/waitlist | customer| Join waitlist for category|
| GET    | /api/waitlist                  | customer | My waitlist entries      |
| DELETE | /api/waitlist/:id              | customer | Leave waitlist           |

---

## Database Schema

```
users              (id, name, email, password_hash, role, created_at)
venues             (id, name, address, rows, columns, created_at)
seat_categories    (id, venue_id, name, color, description)
seats              (id, venue_id, category_id, row_label, col_number, label)
events             (id, title, description, type, venue_id, date, duration, created_by, poster_url)
event_pricings     (id, event_id, category_id, price)
show_seats         (id, event_id, seat_id, status[available|held|booked], held_by, held_at, held_until, booking_id)
bookings           (id, reference[unique], user_id, event_id, total_amount, status[confirmed|cancelled], qr_code)
booking_seats      (id, booking_id, show_seat_id[unique], price_at_time)
waitlist           (id, user_id, event_id, category_id, status[waiting|offered|expired|booked|cancelled], offered_at, offered_until)
```

---

## Key Logic Explanations

### Seat Hold TTL & Auto-Release

- Configurable via `SEAT_HOLD_TTL_MINUTES` env var (default 10 min)
- `POST /holds` sets `held_until = NOW() + TTL` using a Prisma transaction with `SELECT ... FOR UPDATE` row-level locking
- A `node-cron` job runs every 60 seconds: queries `show_seats WHERE status='held' AND held_until < NOW()`, releases them, and broadcasts via Socket.IO

### Concurrency Prevention

- `SELECT ... FOR UPDATE` locks the targeted `show_seat` rows at the database level inside a Prisma transaction
- Two concurrent `POST /holds` for the same seat cannot both succeed — the second transaction will see the seat as `held` (or `booked`) and throw a 409
- Booking also runs in a transaction with `FOR UPDATE`, re-verifying seat ownership and hold expiry before finalising

### Waitlist Auto-Assignment Flow

1. On booking cancellation, the system finds the earliest `waiting` waitlist entry for the same `(event_id, category_id)`
2. Sets its status to `offered` with `offered_until = NOW() + 30min`
3. Holds the released seat for that user via `show_seat.held_by`
4. Sends an email with a time-limited link
5. A cron job expires stale offers every 60 seconds and releases the seat back to available
6. The next person in the queue gets the offer on the next cancellation (no automatic cascading — each cancellation triggers one offer)

### Real-Time Seat Map

- Seat map endpoint returns seats grouped by row with per-seat status, category, and colour
- Frontend connects via Socket.IO on the event detail page, joins `event:<id>` room
- Any hold, release, booking, or cron expiry emits `seat:updated` to all clients in the room
- Frontend updates the visual map instantly without polling
