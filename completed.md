# Project Checklist

## Phase 0 — Project Setup
- [x] Initialize git repository
- [x] Create .gitignore (exclude agent/, planning.md, node_modules, .env, build artifacts)
- [x] Create planning.md with full project roadmap
- [x] Create completed.md checklist

## Phase 1 — Project Setup & Auth
- [ ] Backend: Express + TypeScript initialized
- [ ] Frontend: React + Vite + TypeScript initialized
- [ ] Prisma schema: User model
- [ ] JWT auth middleware + role guard
- [ ] Register / Login / Me endpoints
- [ ] Frontend auth pages (Login, Register)

## Phase 2 — Venue & Event Management
- [ ] Admin: Venue CRUD
- [ ] Admin: Seat categories + seat layout
- [ ] Organiser: Event CRUD
- [ ] Organiser: Per-category pricing
- [ ] Frontend: Admin dashboard
- [ ] Frontend: Organiser dashboard

## Phase 3 — Seat Map & Seat Hold
- [ ] ShowSeats generated on event creation
- [ ] GET /events/:id/seats (seat grid with statuses)
- [ ] POST /holds with SELECT FOR UPDATE concurrency
- [ ] Seat hold TTL: cron-based auto-release
- [ ] Socket.IO: real-time seat status broadcast
- [ ] Frontend: Visual seat map component

## Phase 4 — Booking & Payment
- [ ] POST /bookings atomic transaction
- [ ] QR code generation
- [ ] Email delivery with QR code
- [ ] Frontend: Checkout flow
- [ ] Frontend: Booking history

## Phase 5 — Waitlist & Auto-Assignment
- [ ] POST /events/:id/waitlist
- [ ] Waitlist FIFO queue per (event, category)
- [ ] Auto-assignment on cancellation
- [ ] Time-limited offer flow with email
- [ ] Cron: expire stale offers, promote next in line
- [ ] Frontend: Waitlist join / status UI

## Phase 6 — Organiser Dashboard & Polish
- [ ] Booking summary + revenue per event
- [ ] Event filtering / search
- [ ] Error handling, loading states, edge cases
- [ ] README with setup guide, API docs, DB schema

## Phase 7 — System Design & Deployment
- [ ] system-design.md (≤800 words)
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel)
- [ ] End-to-end testing
- [ ] Final cleanup & zip
