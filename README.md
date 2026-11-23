# Pintora

Pintora is a responsive art-learning website built with Next.js.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

Create `.env.local` with your project's URL and **publishable** key (Supabase dashboard → Connect). Never use a secret or service role key here.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Set the same two variables in your host's build settings when you deploy.

The database setup is in `supabase/migrations`. Run each file once, in order, in the dashboard's SQL Editor. Under Authentication → URL Configuration, set the Site URL to the site's address and allow `<address>/**` as a redirect URL.

## Production build

```bash
npm run build
```
