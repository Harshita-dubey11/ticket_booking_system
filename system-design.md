# Ticket Booking System — System Design

## Architecture Overview

The system follows a **client-server architecture** with a React SPA frontend communicating with a Node.js/Express REST API over HTTP. Real-time seat updates use WebSocket (Socket.IO). The backend connects to a PostgreSQL database (Neon serverless) via Prisma ORM.

```
┌─────────────────┐     HTTP/REST      ┌──────────────────┐     Prisma     ┌────────────┐
│  React + Vite   │ ◄──────────────►   │  Express + Node  │ ◄────────────► │ PostgreSQL │
│  (shadcn/ui)    │     Socket.IO       │  (WebSocket)     │     ORM        │  (Neon)    │
└─────────────────┘                    └──────────────────┘                └────────────┘
```

## Key Design Decisions

### 1. Concurrency via Row-Level Locking
Seat holds and bookings use PostgreSQL's `SELECT ... FOR UPDATE` inside Prisma interactive transactions. This acquires row-level locks on the specific `show_seats` rows, preventing two users from holding or booking the same seat simultaneously. The lock is released when the transaction commits or rolls back. This approach was chosen over optimistic locking because seat contention is expected to be high during popular events; pessimistic locking provides stronger guarantees.

### 2. Seat Hold TTL with Cron Cleanup
Held seats have a configurable TTL (default 10 min via `SEAT_HOLD_TTL_MINUTES`). A `node-cron` job runs every 60 seconds executing: `UPDATE show_seats SET status='available', ... WHERE status='held' AND held_until < NOW()`. Expired holds trigger Socket.IO broadcasts so all connected clients see the seat become available in real time. This avoids stale holds from abandoned sessions.

### 3. Atomic Booking Transaction
Booking creation wraps the following in a single Prisma `$transaction`:
- Re-verify all show seats are held by the user and not expired (using FOR UPDATE)
- Calculate total from event pricing
- Create booking record (status: pending → confirmed)
- Update show_seat status to "booked" and link booking_id
- Upsert BookingSeat records with price-at-time
- Generate QR code (qrcode package, base64 PNG)

If any step fails, the entire transaction rolls back, preventing partial bookings.

### 4. Waitlist with FIFO Auto-Assignment
Each (event, category) pair maintains a FIFO queue. On booking cancellation:
1. Seat is released (status → available)
2. Old BookingSeat records are deleted
3. First "waiting" waitlist entry is found (ordered by created_at)
4. Entry status → "offered" with 30-min TTL, seat held exclusively for that user
5. Email sent with claim link
6. Cron expires stale offers (no auto-cascade to preserve availability)

### 5. Real-Time Updates
Socket.IO uses event room channels (`event:<eventId>`). Any seat status change (hold, release, book, cancel, cron expiry) emits a `seat:updated` event to the room. All connected clients update their seat map in real time without polling.

### 6. QR Code & Email
QR codes are generated server-side as PNG → base64 and stored in the booking record. Nodemailer sends confirmation emails with the QR as an inline image attachment. Email delivery is non-blocking — failures (e.g., missing SMTP credentials) are logged but don't affect booking completion.

## Database Schema (9 Models)

- **User** — customer / organiser / admin roles
- **Venue** — physical location with rows × columns dimensions
- **SeatCategory** — Premium/Standard tiers per venue (colour-coded)
- **Seat** — physical seat at a venue (row, column, label)
- **Event** — movie or concert at a venue on a date
- **EventPricing** — per-category pricing for an event
- **ShowSeat** — event-specific seat instance (available/held/booked)
- **Booking** — user's booking with reference, QR, total, status
- **BookingSeat** — links booking to show seats with captured price
- **Waitlist** — per-category FIFO queue with offer tracking

## API Surface

Public endpoints for browsing events/seat maps. Authenticated endpoints for holds (FOR UPDATE), bookings (atomic transaction), and waitlist. Admin endpoints for venue/seat management. Organiser endpoints for event CRUD and revenue reports.

## Deployment

Backend: Node.js/Express on Render/Railway. Frontend: Vite build deployed to Vercel. PostgreSQL: Neon serverless (auto-scaling, worldwide regions).
