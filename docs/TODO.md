# TODO

## Remaining / Future Work

### High Priority
- [ ] Rate limiting on auth routes (POST /api/auth/send-otp, /verify-otp, /admin-login)
  - Use express-rate-limit or similar

### Medium Priority
- [ ] Real SMS OTP delivery integration (Twilio / MSG91 / AWS SNS)
  - Currently always returns 123456; safe for demo but not production
- [ ] Image upload to real object storage (S3, GCS, Cloudinary)
  - uploadService.uploadImage() currently returns the dataUrl as-is
- [ ] Data persistence across restarts
  - Current in-memory DB resets on every server restart
  - Options: SQLite (better-sqlite3), LowDB (JSON file), or PostgreSQL

### Low Priority
- [ ] Email notifications (SendGrid / Nodemailer) for critical events
  - Owner approval/rejection, new inquiry, visit confirmation
- [ ] Full-text property search index (for production scale)
- [ ] Pagination cursor-based (current offset-based pagination is fine for demo scale)
- [ ] Refresh token flow (current JWTs are stateless; no revocation)
- [ ] Password reset flow for admin accounts

## Not Required
- Automated test suite (not requested by user)
- OpenAPI/Swagger documentation (not requested)
- Docker / CI-CD setup (not requested)
