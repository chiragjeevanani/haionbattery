# Aexto battery website

Website and admin panel for Aexto, a maker of lithium battery packs for electric vehicles.

- `frontend/` React + Vite. Website in `src/modules/website`, admin panel in `src/modules/admin`.
- `backend/` Express API with a JSON file database, JWT admin sign-in and picture uploads.

## Run it locally

```bash
# terminal 1: API on :5000
cd backend
cp .env.example .env     # then edit JWT_SECRET and the admin password
npm install
npm run seed             # creates the starter data (run once)
npm run dev

# terminal 2: website on :5173
cd frontend
npm install
npm run dev
```

Website: http://localhost:5173 . Admin: http://localhost:5173/admin (email and password from `backend/.env`).

## What the admin controls

Products (pictures, specs, price, featured, visible), categories, enquiries from the forms,
the phone and WhatsApp numbers and message templates, the home page headline, lead and pictures,
the about page, questions, search text and social links.

## Deploy

**API on Render.** New > Blueprint > choose this repo. `render.yaml` creates the `aexto-api` service.
Read the generated `ADMIN_PASSWORD` in the service's Environment tab. The free plan wipes its disk on every
deploy and restart (products, settings and uploads reset), so for real use switch to the Starter plan and
enable the disk block in `render.yaml`.

**Website on Vercel.** Import this repo, set **Root Directory** to `frontend`. `frontend/vercel.json` forwards
`/api` and `/uploads` to the Render service. If Render gives the service a different address than
`https://aexto-api.onrender.com`, change it in `frontend/vercel.json` and redeploy.

## Content to replace

The photographs are licensed stand-ins from Wikimedia Commons (credits on `/credits`). Replace them with
Aexto's own through Admin > Site settings and Admin > Products. The seeded products, specs and the
phone and WhatsApp numbers are placeholders.
