# VerdiScan 🌿

AI-powered plant health analysis. Upload a photo of a plant, fruit, flower, or tree and get an instant health report: disease detection, treatment plan, recovery estimate, and a RAG chatbot to ask follow-up questions.

Built for the **BanoQabil × Alibaba hackathon**.

## Features

- 📸 Upload or capture a plant photo
- 🩺 Instant AI health report (disease, confidence, treatment, recovery timeline, care tips)
- 💬 RAG chatbot that answers questions about your plant using curated knowledge + the report
- 🔗 **Shareable reports** — share a public link that works on any device (stored in Supabase)
- 🌐 Works with or without an API key (demo mode for tomato, rose, monstera, lemon)

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **React 19** + Tailwind CSS v4
- **Google Gemini** (vision analysis + chat + embeddings) — 3-key pool with round-robin, retry & model fallback
- **Supabase** (Postgres `reports` table + public `plant-images` Storage bucket) for shareable report links
- **Vercel** deployment

## Getting Started

```bash
npm install
npm run dev -- -H 0.0.0.0
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL (`https://<ref>.supabase.co`) — server-only |
| `SUPABASE_ANON_KEY` | Supabase **publishable** key — server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key (server-only, never in client) |
| `GEMINI_API_KEY` / `_2` / `_3` | Google Gemini API keys (optional; round-robin for rate limits) |

> ⚠️ Never commit `.env.local`. The **secret key** and Gemini keys must only live server-side / in Vercel env vars.

## Supabase Setup (one-time)

1. Create a table (SQL Editor):

```sql
create table if not exists reports (
  id uuid primary key,
  analysis jsonb not null,
  created_at timestamptz default now()
);
alter table reports enable row level security;
create policy "public read reports" on reports for select using (true);
```

2. Create a **public** Storage bucket named `plant-images`.

## How Sharing Works (Option B)

- Reports are stored **locally** (localStorage) until the user clicks **Share report**.
- On share, the compressed image is uploaded to Supabase Storage and the analysis JSON to the `reports` table, returning a public `/analyze/<id>?shared=1` link.
- Opening that link on any device loads the report from Supabase.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add all env vars above in the Vercel project dashboard.
