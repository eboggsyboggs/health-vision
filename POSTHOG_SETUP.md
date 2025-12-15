# PostHog Analytics Setup Guide

This guide will help you set up PostHog analytics for the Health Summit app.

## Prerequisites

- A PostHog account (sign up at https://posthog.com)
- Your app's `.env` file

## Step 1: Create a PostHog Project

1. Go to https://app.posthog.com
2. Sign up or log in
3. Create a new project:
   - **Project name**: Health Summit (or your preferred name)
   - Choose your region (US or EU)
4. Click "Create project"

## Step 2: Get Your API Key

1. After creating your project, you'll see a setup screen
2. Look for your **Project API Key** (starts with `phc_`)
3. Note your **API Host** (usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

4. Add these to your `.env` file:
```bash
VITE_POSTHOG_API_KEY=phc_your_api_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

## Step 3: Verify Installation

1. Restart your development server:
```bash
npm run dev
```

2. Open your app in the browser
3. Check the browser console - you should see: "PostHog initialized successfully"
4. In PostHog dashboard, go to **Activity** - you should see events coming in!

## Events Being Tracked

The app automatically tracks the following events:

### User Journey Events
- **`journey_started`** - When user clicks "Begin Your Ascent"
- **`journey_exited`** - When user returns to landing page
- **`step_viewed`** - When user navigates to a step
  - Properties: `{ step: 'vision' | 'basecamp' | 'current' | 'capacity' | 'summary' }`

### Data Persistence Events (when Supabase is configured)
- **`journey_saved`** - When journey data is saved
  - Properties: `{ step: current_step }`
- **`journey_loaded`** - When journey data is loaded
- **`journey_completed`** - When user completes the journey
- **`journey_deleted`** - When user deletes their journey
- **`journey_save_failed`** - When save operation fails
  - Properties: `{ error: error_message }`

### Automatic Tracking
PostHog also automatically captures:
- **Page views** - Every page/step transition
- **Button clicks** - All button interactions
- **Form interactions** - Input focus and changes
- **Session recordings** - Visual playback of user sessions (with input masking)

## Step 4: Explore Your Analytics

### Key Dashboards to Create

1. **Journey Completion Funnel**
   - Events: `journey_started` → `step_viewed` (vision) → `step_viewed` (basecamp) → `step_viewed` (current) → `step_viewed` (capacity) → `step_viewed` (summary)
   - Shows where users drop off

2. **Step Engagement**
   - Event: `step_viewed`
   - Breakdown by: `step` property
   - Shows which steps are most/least visited

3. **Save Success Rate**
   - Events: `journey_saved` vs `journey_save_failed`
   - Monitor data persistence health

### Useful Insights

Go to **Insights** and create:

1. **Trend**: Count of `journey_started` over time
2. **Funnel**: Journey completion rate
3. **Retention**: How many users return to complete their journey
4. **Session Recording**: Watch actual user sessions to understand behavior

## Step 5: Enable Session Recordings

Session recordings are already enabled with privacy settings:
- All input fields are masked by default
- Add `data-private` attribute to any element you want to mask
- Recordings help you understand user behavior and find UX issues

To view recordings:
1. Go to **Session Recordings** in PostHog
2. Filter by events (e.g., `journey_started`)
3. Watch how users interact with your app

## Step 6: Set Up Alerts (Optional)

Create alerts for important events:

1. Go to **Alerts** in PostHog
2. Create a new alert for:
   - Drop in `journey_started` events (indicates traffic issues)
   - Spike in `journey_save_failed` (indicates backend issues)
   - Low completion rate (indicates UX problems)

## Privacy & Compliance

The app is configured with privacy in mind:

- ✅ **Input masking** - All form inputs are masked in recordings
- ✅ **Identified users only** - Person profiles created only for identified users
- ✅ **No PII in events** - Event properties don't include personal information
- ✅ **GDPR compliant** - PostHog is GDPR compliant
- ✅ **Data residency** - Choose US or EU hosting

### For GDPR/Privacy Compliance

Add a cookie consent banner if required in your region. Example:

```javascript
// Only initialize PostHog after user consent
if (userHasConsented) {
  initPostHog()
}
```

## Troubleshooting

### "PostHog API key not found" warning
- Make sure your `.env` file has `VITE_POSTHOG_API_KEY`
- Restart your dev server after adding environment variables
- Verify the key starts with `phc_`

### Events not showing in PostHog
- Check browser console for errors
- Verify your API key is correct
- Make sure you're looking at the correct project
- Wait a few seconds - events may take time to appear

### Session recordings not working
- Check that session recording is enabled in PostHog project settings
- Verify your PostHog plan includes session recordings
- Clear browser cache and try again

## Advanced Features

### Identify Users (when you add authentication)

```javascript
import { identifyUser } from './lib/posthog'

// After user logs in
identifyUser(userId, {
  email: user.email,
  name: user.name,
  plan: 'free'
})
```

### Track Custom Events

```javascript
import { trackEvent } from './lib/posthog'

// Track any custom event
trackEvent('pdf_downloaded', {
  format: 'pdf',
  step: 'summary'
})
```

### Feature Flags (for A/B testing)

PostHog supports feature flags for testing new features:

```javascript
import posthog from './lib/posthog'

if (posthog.isFeatureEnabled('new-ui-design')) {
  // Show new UI
} else {
  // Show old UI
}
```

## Cost Considerations

PostHog pricing (as of 2024):
- **Free tier**: 1M events/month, 5K session recordings/month
- **Paid**: Pay-as-you-go after free tier
- **Self-hosted**: Free, unlimited (requires your own infrastructure)

For this app, the free tier should be sufficient unless you have high traffic.

## Next Steps

Consider:
- Creating custom dashboards for key metrics
- Setting up alerts for critical events
- Using feature flags for A/B testing
- Integrating with other tools (Slack, email, etc.)
- Analyzing user behavior to improve UX

## Resources

- PostHog Docs: https://posthog.com/docs
- PostHog Community: https://posthog.com/questions
- JavaScript SDK: https://posthog.com/docs/libraries/js
