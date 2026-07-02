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
