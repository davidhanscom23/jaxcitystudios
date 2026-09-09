# JaxCity Studios

Website for **JaxCity Studios** — music recording and podcast production in Jacksonville, Florida.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Stripe Checkout for 50% deposits (test mode by default)
- SQLite studio calendar (`data/jaxcity.db`) for room availability

## Develop

```bash
npm install
cp .env.example .env.local
# Add STRIPE_SECRET_KEY=sk_test_... for deposit checkout
npm run db:init   # creates data/jaxcity.db + sample booked slots
npm run dev
```

## Studio availability database

SQLite file at `data/jaxcity.db` (gitignored). Tables: `rooms`, `studio_hours`, `bookings`.

- `GET /api/availability?room=venus&date=YYYY-MM-DD&hours=2` — open start times only
- Booking modal loads that list and will not offer taken slots
- Checkout re-checks the calendar, creates a `held` booking, then confirms after Stripe success

Default studio hours (sample, editable in `studio_hours`): **10:00–22:00**, 30-minute slots, two-hour minimum.

Optional: set `DATABASE_PATH` to put the DB somewhere else.
## Stripe — where to paste your live key

**One instruction:** paste your live Stripe secret key into the environment variable named **`STRIPE_LIVE_SECRET_KEY`** (in `.env.local` or your host’s secret store), set `STRIPE_MODE=live`, and set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your `pk_live_...` key.

Until then, use `STRIPE_SECRET_KEY` with `sk_test_...` and keep `STRIPE_MODE=test`. Checkout talks to real Stripe Checkout in test mode; it does **not** silently fake a successful payment. Without a key, the Book → Pay deposit step returns a clear configuration error.

Deposit checkout is implemented with Next.js Route Handlers + Stripe Checkout (Lovable Cloud was not available in this environment).

## Scripts

- `npm run dev` — local server
- `npm run build` — production build
- `npm run start` — serve build
- `npm run lint` — ESLint
- `npm run db:init` — create/seed the availability database
- `npm run verify:rates` — rate-card proof checks

## Notes

- Testimonials were omitted: no verifiable public reviews.
- Series and Studio Partner packages mix published studio hours with **sample** post-production estimates researched against Jacksonville studios (IA Digital, AGUYB, Mix Theory).
- Address placeholder: “Studio address — to be added.”
