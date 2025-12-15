# Integration Guide: PostHog & Supabase

This guide provides a quick overview of integrating PostHog analytics and Supabase backend into your Health Summit app.

## Overview

Both integrations are **optional** and can be enabled independently:

- **PostHog**: Analytics, user behavior tracking, and session recordings
- **Supabase**: Backend database for saving and syncing user journeys

The app works perfectly fine without either integration - they just add extra capabilities.

## Quick Start

### 1. Copy Environment Variables

```bash
cp .env.example .env
```

### 2. Choose Your Integrations

You can enable:
- ✅ **Both** (recommended for production)
- ✅ **PostHog only** (if you only want analytics)
- ✅ **Supabase only** (if you only want data persistence)
- ✅ **Neither** (app works standalone with browser localStorage)

### 3. Set Up PostHog (Optional)

**Time required**: ~5 minutes

1. Sign up at https://posthog.com
2. Create a new project
3. Copy your API key and host
4. Add to `.env`:
   ```bash
   VITE_POSTHOG_API_KEY=phc_your_key_here
   VITE_POSTHOG_HOST=https://us.i.posthog.com
   ```

📖 **Detailed guide**: See `POSTHOG_SETUP.md`

### 4. Set Up Supabase (Optional)

**Time required**: ~10 minutes

1. Sign up at https://supabase.com
2. Create a new project
3. Run the SQL schema (provided in setup guide)
4. Copy your project URL and anon key
5. Add to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

📖 **Detailed guide**: See `SUPABASE_SETUP.md`

### 5. Restart Your Dev Server

```bash
npm run dev
```

## What Gets Tracked (PostHog)

When PostHog is enabled, the app automatically tracks:

### Journey Events
- `journey_started` - User begins their health journey
- `journey_exited` - User returns to landing page
- `step_viewed` - User navigates to a step (with step name)

### Data Events (when Supabase is also enabled)
- `journey_saved` - Progress auto-saved
- `journey_loaded` - Progress restored
- `journey_completed` - Journey finished
- `journey_save_failed` - Save error occurred

### Automatic Tracking
- Page views
- Button clicks
- Form interactions
- Session recordings (with privacy masking)

## What Gets Saved (Supabase)

When Supabase is enabled, the app automatically saves:

- **All form responses** - Vision, barriers, habits, etc.
- **Current step** - Where user left off
- **Progress status** - Completed or in-progress
- **Timestamps** - When created and last updated

### Data Privacy
- Anonymous by default (uses session ID)
- Can be linked to user accounts later
- Row Level Security (RLS) ensures data isolation
- No PII stored without explicit user action

## Features by Integration

| Feature | No Integration | PostHog Only | Supabase Only | Both |
|---------|---------------|--------------|---------------|------|
| Basic journey flow | ✅ | ✅ | ✅ | ✅ |
| Browser localStorage | ✅ | ✅ | ✅ | ✅ |
| Analytics tracking | ❌ | ✅ | ❌ | ✅ |
| Session recordings | ❌ | ✅ | ❌ | ✅ |
| Cross-device sync | ❌ | ❌ | ✅ | ✅ |
| Data backup | ❌ | ❌ | ✅ | ✅ |
| Save tracking | ❌ | ❌ | ❌ | ✅ |

## Testing Your Setup

### Test PostHog

1. Start your app: `npm run dev`
2. Open browser console
3. Look for: `"PostHog initialized successfully"`
4. Complete an action (start journey)
5. Check PostHog dashboard for events

### Test Supabase

1. Start your app: `npm run dev`
2. Open browser console
3. Look for: `"Supabase client initialized successfully"`
4. Fill in a form field
5. Wait 1 second (auto-save delay)
6. Check Supabase Table Editor for data

### Test Both Together

1. Start journey and fill in some data
2. Check PostHog for `journey_saved` event
3. Check Supabase for saved data
4. Refresh page - data should reload
5. Check PostHog for `journey_loaded` event

## Troubleshooting

### PostHog not working

**Symptom**: No events in PostHog dashboard

**Solutions**:
- Check `.env` has `VITE_POSTHOG_API_KEY`
- Verify key starts with `phc_`
- Restart dev server after adding env vars
- Check browser console for errors
- Wait 30 seconds for events to appear

### Supabase not working

**Symptom**: "Supabase not configured" warning

**Solutions**:
- Check `.env` has both URL and anon key
- Verify you ran the SQL schema
- Restart dev server after adding env vars
- Check browser console for errors
- Verify RLS policies are set up

### Data not saving

**Symptom**: Progress lost on refresh

**Solutions**:
- Check Supabase is configured (see above)
- Look for save errors in console
- Verify table name is `health_journeys`
- Check RLS policies allow anonymous access
- Try clearing browser cache

### Events tracked but no data saved

**Symptom**: PostHog shows events, but Supabase is empty

**Solutions**:
- This is normal if Supabase isn't configured
- PostHog works independently of Supabase
- Add Supabase credentials to enable saving

## Development vs Production

### Development
- Console logs show initialization status
- Errors are logged to console
- PostHog tracks all events
- Supabase uses development database

### Production
- No console logs (except errors)
- Use environment variables from hosting platform
- Consider rate limiting for Supabase
- Monitor PostHog for usage patterns

## Environment Variables Summary

```bash
# OpenAI (Optional - for AI enhancement)
VITE_OPENAI_API_KEY=sk-...

# PostHog (Optional - for analytics)
VITE_POSTHOG_API_KEY=phc_...
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Supabase (Optional - for data persistence)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode keys
3. **Enable RLS in Supabase** - Protect user data
4. **Use anon key only** - Never expose service key
5. **Mask sensitive inputs** - Already configured in PostHog
6. **Regular security audits** - Check Supabase logs

## Cost Considerations

### PostHog
- **Free tier**: 1M events/month, 5K recordings/month
- **Typical usage**: ~100-500 events per user journey
- **Estimate**: Free tier supports ~2,000-10,000 journeys/month

### Supabase
- **Free tier**: 500MB database, 50K monthly active users
- **Typical usage**: ~5KB per journey
- **Estimate**: Free tier supports ~100,000 journeys

Both services have generous free tiers suitable for most use cases.

## Next Steps

1. ✅ Set up PostHog for analytics
2. ✅ Set up Supabase for data persistence
3. 📊 Create PostHog dashboards
4. 🔐 (Optional) Add user authentication
5. 📧 (Optional) Add email notifications
6. 🚀 Deploy to production

## Support

- **PostHog**: https://posthog.com/docs
- **Supabase**: https://supabase.com/docs
- **This app**: See individual setup guides

## Additional Resources

- `POSTHOG_SETUP.md` - Detailed PostHog configuration
- `SUPABASE_SETUP.md` - Detailed Supabase configuration
- `AI_SETUP.md` - OpenAI integration guide
- `README.md` - General app documentation
