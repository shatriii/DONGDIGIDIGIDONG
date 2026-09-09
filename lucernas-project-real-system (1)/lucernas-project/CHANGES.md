# Lucernas — Mock Data Removed / Real System

## Roles: now exactly 3, all backend-authenticated
No more hardcoded frontend account list. Every login goes through
`POST /api/auth/login`, which checks three real database tables:

| Role      | Table         | Seed script          | Default login (change these!) |
|-----------|---------------|-----------------------|--------------------------------|
| admin     | system_admin  | (create manually)     | —                               |
| organizer | organizers    | `seed-organizer.js`   | organizer@tsu.edu / organizer123 |
| governor  | governors     | `seed-governor.js`    | governor@tsu.edu / governor123 |

**To set this up:**
1. Run `backend/migrations/002_create_governors_table.sql` against your database
   (this creates the new `governors` table).
2. Run `node seed-organizer.js` and `node seed-governor.js` once each to create
   test accounts (or insert your real accounts with a bcrypt-hashed password
   the same way).
3. Change the seeded passwords before going live.

**Governor permissions**: view Dashboard, Analytics, and College Dashboard
(read-only — no resend button, no ticket generation, no scanning). Admin has
full access. Organizer has QR Scanner + College Dashboard (view only, no
generation).

## Every remaining mock/prototype removed
- **CollegeDashboard**: was a hardcoded 6-student array with fake
  "Send via Gmail / Bluetooth" buttons that didn't send anything. Now pulls
  the real student roster from `GET /api/students` and its one real action —
  "Resend Email" — calls `POST /api/tickets/resend` (admin only). Bluetooth
  distribution was removed outright: it's not something a web app can
  actually do, so it was never going to be real.
- Confirmed no other page has hardcoded arrays, `ACCOUNTS` tables, or
  `mock`-labeled logic left — `LoginPage`, `QRScanner`, `TicketGeneration`,
  `QRViewer`, `AdminDashboard`, `AnalyticsDashboard`, `SignupPage` were all
  already wired to real endpoints from the previous pass; this pass closed
  the last gap (CollegeDashboard) and added the governor role everywhere
  role lists appear (Sidebar nav, route guards, login redirect).

## New backend pieces (this pass)
- `migrations/002_create_governors_table.sql` — new table.
- `seed-governor.js` — creates a test governor account.
- `authController.login` — added a third branch checking `governors`.
- `ticketRoutes` (`GET /`, `GET /:ticketid`) and `studentRoutes` (`GET /`)
  now also allow role `governor` (read-only view access).

## Still true from before
- Rotate the secrets in `.env` — they were exposed in an earlier upload.
- No DB/browser available in this environment to run the full flow —
  please test locally, especially: governor login → dashboard/analytics/
  college view-only access, and organizer/admin flows still working after
  the role-list changes.
