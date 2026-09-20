<div align="center">

<img src="./edit-theory-concierge-logo.png" width="120" alt="Edit Theory Concierge logo" />

# Edit Theory Concierge

**A universal booking assistant for local businesses.**
Search a venue, book it, get a real confirmation, all in one flow.

🟡 **Demo mode** — architecture is production-ready; two integrations activate on real credentials, see [Demo Mode](#demo-mode-disclosed) below.

[Live Demo](https://edit-theory-concierge-s6ra.vercel.app) · [Backend Case Study](https://github.com/Samhita1008/edit-theory-agents/tree/main/6-edit-theory-concierge) · [Report an Issue](../../issues)

</div>

---

## What it is

Restaurants, gyms, salons, parlours, travel agencies, one booking flow for all of them. A customer picks a category, searches in plain language ("italian in chennai"), sees a ranked list of real venues, books in a couple of taps, and gets a live status screen that resolves to a real confirmation email.

This isn't an internal tool. It's the customer-facing frontend for [Edit Theory](https://github.com/Samhita1008), a product a business could hand to their own customers, not something used behind the scenes.

## Screens

| Discover | Results | Book | Status |
|---|---|---|---|
| Category + free-text search | Ranked venue cards | Category-aware form | Live polling to resolution |

*(swap in real screenshots or a short GIF here once captured)*

## Stack

React · TypeScript · Tailwind CSS · Vite

Talks to an [n8n backend](https://github.com/Samhita1008/edit-theory-agents/tree/main/6-edit-theory-concierge) over three webhooks: discover, book, status.

## Demo mode, disclosed

Two pieces of this system are built end-to-end but intentionally simulated in the public demo:

- **Venue discovery** runs on free OpenStreetMap data by default. A production Google Places integration is built and wired on the backend, inactive until a real API key is supplied.
- **Venue confirmation** is simulated (a timed random outcome standing in for a real reply) since going live requires an actual business partner and an approved WhatsApp Business message template. The real WhatsApp Cloud API integration is built and wired the same way, inactive until a partner's credentials exist.

Nothing about the customer-facing flow changes when either integration activates, only what happens behind the two webhook calls. Full technical writeup, including the exact bugs hit building this, lives in the [backend case study](https://github.com/Samhita1008/edit-theory-agents/tree/main/6-edit-theory-concierge).

## Running locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and point the three `VITE_WEBHOOK_*` variables at a running backend. Left unset, the app falls back to demo data so it always renders something reasonable.

```bash
VITE_WEBHOOK_DISCOVER=
VITE_WEBHOOK_BOOK=
VITE_WEBHOOK_STATUS=
```

## Deploying

Built with Vite, deploys cleanly to Vercel (root directory = repo root, build command `npm run build`, output `dist`). Add the same three env vars in the Vercel dashboard for a fully connected deployment, or leave them blank for an always-available public demo.

## Why this exists

Most automation work is invisible, a workflow humming in the background that only its owner ever sees. This one has a front door. Building it forced real product decisions beyond the backend logic: what a customer sees when a search comes back empty, what "pending" should feel like while waiting on a reply, how to be upfront in the UI itself about what's live versus simulated rather than just in a README nobody reads.

---

<div align="center">
Built by <a href="https://github.com/Samhita1008">Samhita</a>, founder of <a href="https://github.com/Samhita1008/edit-theory-agents">Edit Theory</a>
</div>
