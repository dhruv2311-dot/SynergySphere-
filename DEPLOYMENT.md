# SynergySphere Deployment Guide

Quick deployment guide for various platforms.

## 🚀 Deploy to Vercel (Recommended)

### Option 1: Using Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Add Environment Variables**
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **Redeploy**
```bash
vercel --prod
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

## 🌐 Deploy to Netlify

### Using Netlify CLI

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy
```

4. **Deploy to production**
```bash
netlify deploy --prod
```

5. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add your Supabase credentials

### Using Netlify UI

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables
7. Click "Deploy"

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist` folder.

## ✅ Pre-Deployment Checklist

- [ ] All Supabase tables created
- [ ] RLS policies applied
- [ ] Storage bucket configured
- [ ] Realtime enabled
- [ ] Environment variables ready
- [ ] Build completes without errors
- [ ] Test locally with `npm run preview`

## 🔒 Security Notes

- Never commit `.env` file
- Use environment variables for all secrets
- Enable RLS on all Supabase tables
- Keep Supabase anon key public (it's safe)
- Never expose service role key

## 📊 Post-Deployment

1. Test all features in production
2. Monitor Supabase dashboard for errors
3. Check browser console for issues
4. Test on mobile devices

Your app is now live! 🎉
