# Aexto battery website

Website and admin panel for Aexto, a maker of lithium battery packs for electric vehicles.

- `frontend/` React + Vite. Website in `src/modules/website`, admin panel in `src/modules/admin`.
- `backend/` Express API on MongoDB, with JWT admin sign-in. Uploaded pictures are stored in the database too.

## Run it locally

```bash
# terminal 1: API on :5000
cd backend
cp .env.example .env     # then set JWT_SECRET, the admin password and MONGODB_URI
npm install
npm run dev              # the first start fills an empty database with starter content

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

**API on Render.** New > Blueprint > choose this repo. `render.yaml` creates the `aexto-api` service. In its Environment tab set `MONGODB_URI` (your cluster's connection string) and `ADMIN_PASSWORD`. The service uses its own database, `aexto_website`, and fills it with starter content the first time it is empty. Data lives in MongoDB, so deploys and restarts never erase it. In MongoDB Atlas, Network Access must allow the host (for example 0.0.0.0/0).

**Website on Vercel.** Import this repo, set **Root Directory** to `frontend`. `frontend/vercel.json` forwards
`/api` and `/uploads` to the Render service. If Render gives the service a different address than
`https://aexto-api.onrender.com`, change it in `frontend/vercel.json` and redeploy.

## Content to replace

The photographs are licensed stand-ins from Wikimedia Commons (credits on `/credits`). Replace them with
Aexto's own through Admin > Site settings and Admin > Products. The seeded products, specs and the
phone and WhatsApp numbers are placeholders.
