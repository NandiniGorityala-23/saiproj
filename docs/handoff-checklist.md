# Backend Handoff Checklist

Date: 2026-04-29

## Ready

- Core API routes are mounted under `/api`.
- Health check is available at `GET /api/health`.
- Required environment variables are documented in `.env.example`.
- Manufacturer-scoped product, QR, analytics, and manual expiry reminder flows are in place.
- Customer warranty claim and warranty list flows are in place.
- Warranty audit events cover previews, claims, certificate views, and expiry reminders.
- Customer certificate metadata can be served for claimed warranties.
- Admin users can export claims and review batch summaries.

## Recommended Next Work

- Add integration tests with an isolated MongoDB test database.
- Persist outbound email attempts for expiry reminder auditability.
- Add CI for lint, test, and a health-check smoke test.
- Add request rate limits to auth and QR generation endpoints.
