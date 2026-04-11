# Sri Kamatchi Jewellery — Poster Generator

Daily gold & silver rate poster generator for **Sri Kamatchi Jewellery, Pollachi**.

---

## Project Structure

```
Sri-Kamatchi-Jewellery/
├── client/          # Next.js 16 frontend → deploy to Vercel
└── server/          # Express + PostgreSQL backend → deploy to Render
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | Node.js, Express, Socket.io |
| Database | Neon PostgreSQL (images stored as BYTEA — survives restarts) |
| Frontend Host | Vercel (free) |
| Backend Host | Render (free) |

---

## Why Images Are Stored in Neon (Not on Disk)

Render free tier **wipes the filesystem every restart** (~15 min inactivity).  
All images are stored as `BYTEA` binary columns directly in Neon PostgreSQL.  
This means images are **permanent** — no filesystem dependency at all.

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/saikriz898/Sri-Kamatchi-Jewellery.git
cd Sri-Kamatchi-Jewellery
```

### 2. Setup server

```bash
cd server
cp .env.example .env
# Fill in your DATABASE_URL from neon.tech
npm install
npm run dev
```

### 3. Setup client

```bash
cd client
# Create .env.local
echo "NEXT_PUBLIC_SERVER_URL=http://localhost:5000" > .env.local
npm install
npm run dev
```

Client runs on `http://localhost:3000`  
Server runs on `http://localhost:5000`

---

## Deploy — Backend (Render)

### Step 1 — Push code to GitHub
```bash
git push origin main
```

### Step 2 — Create Render Web Service
1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo: `saikriz898/Sri-Kamatchi-Jewellery`
3. Set these settings:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Runtime | Node |

### Step 3 — Add Environment Variables in Render Dashboard

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...neon.tech/neondb?sslmode=require&channel_binding=require` |
| `PORT` | `5000` |

> ⚠️ Do NOT add `UPLOADS_DIR` or `MONGO_URI` — they are no longer used.

### Step 4 — Deploy
Click **Deploy**. Wait for `🚀 Server running on port 5000`.  
Copy your Render URL e.g. `https://sri-kamatchi-jewellery-server.onrender.com`

---

## Deploy — Frontend (Vercel)

### Step 1 — Go to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo: `saikriz898/Sri-Kamatchi-Jewellery`

### Step 2 — Configure Project

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Step 3 — Add Environment Variable

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://sri-kamatchi-jewellery-server.onrender.com` |

> Replace with your actual Render URL from the backend deploy step.

### Step 4 — Deploy
Click **Deploy**. Vercel builds and gives you a URL like:  
`https://sri-kamatchi-jewellery.vercel.app`

---

## Neon DB Setup

### Run this once in Neon SQL Editor

```sql
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  mime_type TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  file_size INTEGER,
  compressed_size INTEGER,
  image_data BYTEA,
  compressed_data BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  gold1g TEXT NOT NULL,
  gold8g TEXT NOT NULL,
  silver1g TEXT NOT NULL,
  date TEXT NOT NULL,
  price_drop_note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_state (
  id SERIAL PRIMARY KEY,
  current_index INTEGER DEFAULT -1,
  last_generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Tables are also auto-created on first server start via `init()` calls.

---

## Environment Variables Summary

### `server/.env` (local only — never commit)
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
```

### `client/.env.local` (local only — never commit)
```
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

---

## Common Issues

| Problem | Cause | Fix |
|---|---|---|
| Images disappear after 2-3 hrs | Render filesystem wipe | Already fixed — images in Neon BYTEA |
| Blank images on load | Wrong API URL | Set `NEXT_PUBLIC_SERVER_URL` in Vercel env vars |
| 404 on `/api/*` | Proxy not reaching backend | Check Render service is running, verify URL |
| DB connection failed | Wrong `DATABASE_URL` | Copy exact string from Neon dashboard |
