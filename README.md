# LEDGER — Farmer Procurement & Payment Ledger

Internal tool for a family-run crop procurement business. Staff record
purchases (bag-by-bag weights), payments to farmers, and view derived
balances and dashboards. Built per `LEDGER-Master-Blueprint-v2.md`.

## Stack

- **API** (`/server`): Node.js + Express, MongoDB + Mongoose, Zod validation, self-hosted JWT auth
- **Web** (`/web`): Next.js 14 (App Router) PWA, Zustand, Tailwind CSS

## Setup

### 1. API

```bash
cd server
cp .env.example .env    # fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed            # creates the first admin (one-time, safe to re-run)
npm run dev             # http://localhost:4000
```

### 2. Web

```bash
cd web
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, default http://localhost:4000
npm install
npm run dev                  # http://localhost:3000
```

Sign in with the seeded admin, then create staff accounts via
`POST /api/auth/users` (admin-only; no public registration).

## Key rules baked in

- Farmer balance is **always derived** (Σ purchases − Σ payments) — never stored.
- Purchase totals are recomputed server-side; client totals are rejected.
- Overpayments are allowed but flagged (`warning: "OVERPAYMENT"`).
- Every create/update/delete on farmers/purchases/payments is audited (append-only).
- Only admins can edit/delete purchases and payments.
- Dashboard periods (today/month/year) are computed in IST; dates stored UTC.

## Notes

- If the API runs behind a reverse proxy, set Express `trust proxy`
  accordingly so login rate-limiting sees real client IPs.
- The PWA caches the app shell only — no offline writes in v1.
