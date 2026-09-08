# JaxCity Studios

Website for **JaxCity Studios** — music recording and podcast production in Jacksonville, Florida.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Stripe Checkout for 50% deposits (test mode by default)

## Develop

```bash
npm install
cp .env.example .env.local
# Add STRIPE_SECRET_KEY=sk_test_... for deposit checkout
npm run dev
```

## Stripe — where to paste your live key

**One instruction:** paste your live Stripe secret key into the environment variable named **`STRIPE_LIVE_SECRET_KEY`** (in `.env.local` or your host’s secret store), set `STRIPE_MODE=live`, and set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your `pk_live_...` key.

Until then, use `STRIPE_SECRET_KEY` with `sk_test_...` and keep `STRIPE_MODE=test`. Checkout talks to real Stripe Checkout in test mode; it does **not** silently fake a successful payment. Without a key, the Book → Pay deposit step returns a clear configuration error.

Deposit checkout is implemented with Next.js Route Handlers + Stripe Checkout (Lovable Cloud was not available in this environment).

## Scripts

- `npm run dev` — local server
- `npm run build` — production build
- `npm run start` — serve build
- `npm run lint` — ESLint

## Notes

- Testimonials were omitted: no verifiable public reviews.
- Series and Studio Partner packages mix published studio hours with **sample** post-production estimates researched against Jacksonville studios (IA Digital, AGUYB, Mix Theory).
- Address placeholder: “Studio address — to be added.”
