# Backend Handoff Checklist

Date: 2026-04-29

## Ready

- Core API routes are mounted under `/api`.
- Health check is available at `GET /api/health`.
- Required environment variables are documented in `.env.example`.
- Manufacturer-scoped product, QR, analytics, and manual expiry reminder flows are in place.
- Customer warranty claim and warranty list flows are in place.

## Recommended Next Work

- Add integration tests with an isolated MongoDB test database.
- Add CI for lint, test, and a health-check smoke test.
- Persist outbound email attempts for expiry reminder auditability.
- Add request rate limits to auth and QR generation endpoints.

