# Project Checklist

## Phase 0 — Project Setup
- [x] Initialize git repository
- [x] Create .gitignore (exclude agent/, planning.md, node_modules, .env, build artifacts)
- [x] Create planning.md with full project roadmap
- [x] Create completed.md checklist

## Phase 1 — Project Setup & Auth
- [x] Backend: Express + TypeScript initialized
- [x] Frontend: React + Vite + TypeScript initialized
- [x] Prisma schema: User model
- [x] JWT auth middleware + role guard
- [x] Register / Login / Me endpoints
- [x] Frontend auth pages (Login, Register)

## Phase 2 — Venue & Event Management
- [x] Prisma schema: Venue, SeatCategory, Seat, Event, EventPricing, ShowSeat, Booking, BookingSeat, Waitlist models
- [x] Admin: Venue CRUD (create, list, get, update, delete)
- [x] Admin: Seat categories (create, update, delete)
- [x] Admin: Auto-generate seats from venue dimensions with category assignment
- [x] Organiser: Event CRUD with auto-showSeat generation
- [x] Organiser: Per-category pricing (setPricing endpoint)
- [x] Organiser: Revenue summary endpoint
- [x] Public: Event browsing with type/search filtering
- [x] Frontend: Admin dashboard (manage venues, categories, generate seats)
- [x] Frontend: Organiser dashboard (manage events, set pricing)
- [x] Frontend: Event browse page with search/filter
- [x] Seed script with test users, venue, categories, and seats

## Phase 3 — Seat Map & Seat Hold
- [x] ShowSeats generated on event creation
- [x] GET /events/:id/seats (seat grid with statuses, grouped by row)
- [x] POST /holds with SELECT FOR UPDATE concurrency protection
- [x] DELETE /holds — release held seats
- [x] GET /holds — list current user's active holds
- [x] Seat hold TTL: node-cron every minute, auto-release expired holds + socket broadcast
- [x] Socket.IO: real-time seat status broadcast on hold/release/expiry
- [x] Frontend: SeatMap component with live status, color-coded categories, selection
- [x] Frontend: EventDetail page with hold/release actions and real-time updates
- [x] Frontend: Socket client service with event room join/leave

## Phase 4 — Booking & Payment
- [x] POST /bookings atomic transaction (FOR UPDATE lock, verify hold, calculate total, create booking+seats)
- [x] QR code generation (qrcode package, PNG → base64, stores in booking record)
- [x] Email delivery with QR code (Nodemailer, configurable SMTP, QR as inline attachment)
- [x] GET /bookings — booking history with QR display
- [x] GET /bookings/:id — single booking detail
- [x] POST /bookings/:id/cancel — cancel + trigger waitlist auto-assignment
- [x] Frontend: Checkout page (held seats summary, confirm booking, confirmation screen)
- [x] Frontend: Booking history page (list, status badges, QR expand, cancel action)

## Phase 5 — Waitlist & Auto-Assignment
- [x] POST /events/:id/waitlist — join waitlist for a category
- [x] GET /waitlist — view my waitlist entries with status
- [x] DELETE /waitlist/:id — leave waitlist
- [x] FIFO queue per (event, category) — ordered by created_at
- [x] Auto-assignment on cancellation — finds next waiting entry, sets offered + holds seat
- [x] Time-limited offer flow with email (30min offer TTL, email with claim link)
- [x] Cron: expire stale offers every minute, release seat, no auto-cascade to next
- [x] Frontend: Waitlist page with status display + leave action
- [x] Frontend: EventDetail has waitlist join buttons per category

## Phase 6 — Organiser Dashboard & Polish
- [x] GET /events/:id/revenue — booking summary + total revenue per event
- [x] Event filtering / search on browse page (by type, text search)
- [x] Error handling across all controllers (asyncHandler wrapper)
- [x] README.md with setup guide, API docs, DB schema, key logic explanations
- [x] .env.example with all configuration fields documented
- [x] Seed script with test accounts and sample data

## Phase 7 — System Design & Deployment
- [x] system-design.md (613 words)
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel)
- [ ] End-to-end testing
- [ ] Final cleanup & zip

## Extra — Alignment with Planning Spec
- [x] poster_url field on Event model (schema + seed + frontend display)
- [x] Booking status "pending" → "confirmed" flow (default: pending)
- [x] DELETE /holds/:showSeatId param-based route added
- [x] Orphaned BookingSeat records cleaned up on cancel
- [x] BookingSeat uses upsert (resilient against stale records)
