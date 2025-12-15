# Quick Start: PostHog & Supabase Integration

## ⚡ 5-Minute Setup

### 1. Install Dependencies (Already Done ✅)
```bash
npm install posthog-js @supabase/supabase-js
```

### 2. Set Up Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```bash
# PostHog Analytics (get from https://app.posthog.com)
VITE_POSTHOG_API_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Supabase Backend (get from https://app.supabase.com)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up PostHog (5 minutes)

1. Go to https://app.posthog.com
2. Create account → New project
3. Copy API key from project settings
4. Paste into `.env`

**That's it!** PostHog is ready.

### 4. Set Up Supabase (10 minutes)

1. Go to https://app.supabase.com
2. Create account → New project
3. Wait for project to initialize (~2 min)
4. Go to SQL Editor → New Query
5. Copy/paste SQL from `SUPABASE_SETUP.md` (Step 3)
6. Click "Run"
7. Go to Settings → API
8. Copy URL and anon key
9. Paste into `.env`

**Done!** Supabase is ready.

### 5. Start Your App

```bash
npm run dev
```

Open browser console - you should see:
- ✅ "PostHog initialized successfully"
- ✅ "Supabase client initialized successfully"

## 🎯 What You Get

### PostHog Analytics
- **Journey tracking**: See how users progress through steps
- **Drop-off analysis**: Identify where users abandon
- **Session recordings**: Watch actual user sessions
- **Event tracking**: All interactions automatically logged

### Supabase Backend
- **Auto-save**: Progress saved every second
- **Cross-device**: Resume on any device
- **Data backup**: Never lose user progress
- **Anonymous**: No login required

## 🧪 Test It

1. Start the app
2. Begin a journey
3. Fill in some fields
4. Check PostHog dashboard → Activity (see events)
5. Check Supabase → Table Editor → health_journeys (see data)
6. Refresh page → Data should reload automatically

## 📊 Key Events Tracked

| Event | When | Properties |
|-------|------|------------|
| `journey_started` | User clicks "Begin Your Ascent" | - |
| `step_viewed` | User navigates to a step | `step` |
| `journey_saved` | Auto-save completes | `step` |
| `journey_loaded` | Progress restored | - |
| `journey_completed` | User finishes journey | - |

## 🔧 Troubleshooting

### PostHog not working?
- Check API key starts with `phc_`
- Restart dev server after adding env vars
- Wait 30 seconds for events to appear

### Supabase not working?
- Verify you ran the SQL schema
- Check both URL and anon key are set
- Restart dev server after adding env vars

### Still having issues?
See detailed guides:
- `POSTHOG_SETUP.md` - Full PostHog guide
- `SUPABASE_SETUP.md` - Full Supabase guide
- `INTEGRATION_GUIDE.md` - Comprehensive integration guide

## 💡 Pro Tips

1. **Start with PostHog** - Easier to set up, immediate value
2. **Add Supabase later** - When you need data persistence
3. **Both are optional** - App works fine without them
4. **Free tiers are generous** - Suitable for most projects
5. **Check console logs** - Shows initialization status in dev mode

## 📚 Documentation

- `POSTHOG_SETUP.md` - Detailed PostHog configuration
- `SUPABASE_SETUP.md` - Detailed Supabase configuration  
- `INTEGRATION_GUIDE.md` - Integration overview
- `README.md` - General app documentation

## 🚀 Ready to Deploy?

Both services work in production:
- Set environment variables in your hosting platform
- PostHog and Supabase handle scaling automatically
- Free tiers support thousands of users

---

**Need help?** Check the detailed setup guides or the troubleshooting sections.
