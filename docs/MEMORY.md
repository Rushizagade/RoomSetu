# PROJECT MEMORY

## Current State
- Backend fully implemented and verified running on port 3000
- Modular architecture: backend/src/{config,constants,database,middlewares,repositories,services,controllers,routes}
- All APIs verified working via HTTP checks

## Completed
- Database engine: backend/src/database/engine.ts (in-memory, 6 seeded properties, 3 owners, 2 users, 1 admin)
- All 10 repositories: admin, audit, inquiry, notification, owner, property, report, saved, user, visit
- All middleware: authenticate, authorize, errorHandler, validator
- Config/utils: env.ts, logger.ts, errors.ts, geo.ts, response.ts
- All 11 services: otp, auth, property, inquiry, visit, saved, notification, upload, admin, location, report
- All 10 controllers: auth, location, property, owner, inquiry, visit, saved, notification, upload, admin
- All 10 route files + app factory (backend/src/app.ts)
- server.ts refactored to use modular backend/src/app.ts
- .env.example updated with all variables
- docs/MEMORY.md, docs/TODO.md created

## API Verification Results
- ✅ GET /health → healthy, 6 properties
- ✅ GET /api/properties/search?lat=18.59&lng=73.76&radius=15 → 4 results
- ✅ GET /api/properties/prop_wakad_001 → property detail with owner name
- ✅ POST /api/auth/send-otp → devOtp=123456
- ✅ POST /api/auth/verify-otp → JWT token issued
- ✅ GET /api/auth/me → authenticated user profile
- ✅ GET /api/notifications → unread count
- ✅ GET /api/saved-properties → 2 saved
- ✅ GET /api/inquiries → user-scoped
- ✅ GET /api/auth/me (no token) → 401 UNAUTHORIZED
- ✅ POST /api/auth/admin-login → ADMIN token
- ✅ GET /api/admin/dashboard → 6 props, 1 pending, 2 users
- ✅ GET /api/admin/properties/pending → 1 pending
- ✅ POST /api/admin/properties/:id/approve → ACTIVE
- ✅ POST /api/admin/properties/:id/reject (no reason) → 400 MISSING_REASON
- ✅ ROOM_OWNER login + /api/owner/dashboard → 3 props, 1178 views
- ✅ GET /api/locations/autocomplete?q=wakad → Wakad

## Important Decisions
- Types shared at src/types/index.ts (frontend + backend)
- In-memory DB only — no persistence between restarts
- Dev: tsx server.ts via node_modules\.bin\tsx.cmd
- Prod: node dist/server.cjs (after esbuild bundle)
- Error format: { success: false, error: { code, message } }
- OTP always 123456 in dev; real random in prod
- Admin password: admin12345 (hashed with bcrypt)

## Important Constraints
- Run with: node_modules\.bin\tsx.cmd server.ts (PowerShell execution policy blocks npx.ps1)
- ESM imports require .ts extension in import paths
- backend/src/** imports from ../../src/types/index.ts (cross-boundary relative path — valid)
- No tests framework set up (not requested)

## Known Issues
- None blocking

## Next Actions
- Optional: Add rate limiting (express-rate-limit) on auth routes
- Optional: Persist data to SQLite/JSON file for dev persistence across restarts
- Optional: Implement real SMS OTP integration (Twilio/MSG91)
- Optional: Implement real image upload to S3/GCS

## Important Files
- server.ts — entry point
- backend/src/app.ts — Express app factory (all routes registered here)
- backend/src/database/engine.ts — in-memory DB + seed data
- backend/src/config/env.ts — all env vars
- src/types/index.ts — shared types
- src/services/api.ts — frontend API client
- .env.example — all required env vars documented
