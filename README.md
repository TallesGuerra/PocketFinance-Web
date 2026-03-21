# PocketFinance Web

Web version of [PocketFinance Android (FinancasDeBolso)](https://github.com/TallesGuerra/FinancasDeBolso) — a personal finance tracker built with Next.js and Supabase.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **PWA:** manifest.json + Service Worker (installable on iPhone/Android)

## Features

- Monthly income & expense tracking
- Category management with icons and colours
- Budget limits with progress tracking
- Month-by-month navigation
- Installable as PWA (add to home screen)

## Getting Started

### 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run the SQL in `supabase/schema.sql` in the SQL Editor.

### 2. Environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy on [Vercel](https://vercel.com) — connect the repo and add the two environment variables above.

## Related

- **Android version:** [FinancasDeBolso](https://github.com/TallesGuerra/FinancasDeBolso) — Kotlin + Jetpack Compose
