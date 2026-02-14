# Dibil — Modern Web Messenger

A Telegram-like web messenger built with React, Supabase, and Tailwind. Dark theme, realtime chat, file and voice messages, PWA-ready.

## Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Router
- **Backend:** Supabase (Auth, Postgres, Realtime, Storage)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of `supabase/schema.sql` to create tables and RLS.
3. In **Storage**, create a bucket named `uploads` and set it to **Public** (or add RLS policies for read/write).
4. In **Authentication > Providers**, enable Email and Google.
5. Copy **Project URL** and **anon public** key to env.

### 2. Env

```bash
cp .env.example .env
```

Fill in:

- `VITE_SUPABASE_URL` — Supabase project URL  
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key  

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173/dibil/](http://localhost:5173/dibil/) (or root if you change `base` in `vite.config.ts`).

### 4. Deploy on GitHub Pages

1. In repo **Settings > Pages**, set source to **GitHub Actions**.
2. Add secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Push to `main`; the workflow will build and deploy.

App will be available at `https://<username>.github.io/dibil/`.

## Scripts

- `npm run dev` — dev server  
- `npm run build` — production build  
- `npm run preview` — preview production build  

## Project structure

- `src/app` — pages and layout  
- `src/components` — UI and chat components  
- `src/hooks` — auth, realtime, messages, typing  
- `src/lib` — Supabase client, api, utils  
- `src/store` — Zustand stores  
- `src/types` — shared types  
- `supabase/schema.sql` — DB schema and RLS  

## License

MIT
