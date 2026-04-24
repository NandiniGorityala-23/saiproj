# OmniWarranty Backend Contributions

Backend-focused repository for simulated February-April 2026 contributions by one backend developer.

## Local Development

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:5000/api`.

## API Areas

- `GET /api/health`
- `/api/auth`
- `/api/products`
- `/api/qrcodes`
- `/api/claim`
- `/api/admin`

## Backend Contributor Coverage

- Backend developer one: core app shell, auth, products, QR generation, claims, analytics, expiry reminders, and handoff baseline.
- Backend developer two: audit trail, certificates, claims export, batch reports, and shared pagination cleanup.
