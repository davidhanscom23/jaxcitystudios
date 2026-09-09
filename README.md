# JaxCity Studios

Website for **JaxCity Studios** — music recording and podcast production in Jacksonville, Florida.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- PayPal Checkout deposits (Venmo via PayPal for eligible US payers)
- Manual Zelle deposit path (no Zelle website API exists)
- SQLite studio calendar (`data/jaxcity.db`) for room availability

## Develop

```bash
npm install
cp env.example .env.local
# Add PayPal sandbox client id + secret
npm run db:init
npm run dev
```

## Payments — PayPal, Venmo, Zelle

| Method | How it works |
| --- | --- |
| **PayPal** | Live checkout via PayPal Orders API + JS buttons |
| **Venmo** | Shown inside PayPal Checkout when `enable-funding=venmo` (US, eligible accounts) |
| **Zelle** | Manual only — site shows send-to instructions and holds the room until the studio confirms |

Paste credentials into `.env.local` (see `env.example`):

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE=sandbox` or `live`
- Optional: `NEXT_PUBLIC_VENMO_HANDLE`, `NEXT_PUBLIC_ZELLE_DESTINATION` (defaults to `jaxcitystudios@gmail.com`)

Stripe has been removed from this project.

## Studio availability database

SQLite file at `data/jaxcity.db` (gitignored). Tables: `rooms`, `studio_hours`, `bookings`.

- `GET /api/availability?room=venus&date=YYYY-MM-DD&hours=2` — open start times only
- Booking modal loads that list and will not offer taken slots
- Checkout holds the slot; PayPal capture confirms; Zelle stays held until manual confirm; cancel releases holds

Default studio hours: **10 AM–2 AM** (overnight close), 30-minute slots, two-hour minimum.

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
