# 🚀 Quick Start Guide

Get SynergySphere running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Set Up Supabase (2 min)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run `SUPABASE_SETUP.sql`
4. Go to Storage → Create bucket named `avatars` (make it public)
5. Go to Database → Replication → Enable for all tables

## Step 3: Configure Environment (30 sec)

1. Copy `.env.example` to `.env`
2. Get credentials from Supabase Settings → API
3. Paste into `.env`:

```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## Step 4: Run the App (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test It Out (1 min)

1. Sign up with email/password
2. Create a project
3. Add a task
4. Send a message
5. Update your profile

## 🎉 Done!

You're ready to collaborate!

## Need Help?

- Full setup: See [SETUP.md](./SETUP.md)
- Features: See [README.md](./README.md)
- Deploy: See [DEPLOYMENT.md](./DEPLOYMENT.md)
