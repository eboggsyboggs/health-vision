# Setup Checklist: PostHog & Supabase

Use this checklist to set up your integrations step by step.

## ✅ Pre-Setup (Already Done)

- [x] Install PostHog SDK (`posthog-js`)
- [x] Install Supabase SDK (`@supabase/supabase-js`)
- [x] Create PostHog configuration file
- [x] Create Supabase configuration file
- [x] Create journey service layer
- [x] Add tracking to app components
- [x] Add auto-save functionality
- [x] Update environment variable examples
- [x] Create documentation

## 📋 Your Setup Tasks

### Step 1: Environment Setup

- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

### Step 2: PostHog Setup (Optional - 5 minutes)

- [ ] Go to https://app.posthog.com
- [ ] Create account (or log in)
- [ ] Create new project
- [ ] Copy API key from project settings
- [ ] Copy API host (usually `https://us.i.posthog.com`)
- [ ] Add to `.env`:
  ```bash
  VITE_POSTHOG_API_KEY=phc_your_key_here
  VITE_POSTHOG_HOST=https://us.i.posthog.com
  ```

### Step 3: Supabase Setup (Optional - 10 minutes)

- [ ] Go to https://app.supabase.com
- [ ] Create account (or log in)
- [ ] Create new project
- [ ] Wait for project initialization (~2 minutes)
- [ ] Go to SQL Editor
- [ ] Click "New Query"
- [ ] Copy SQL from `SUPABASE_SETUP.md` (Step 3)
- [ ] Paste and click "Run"
- [ ] Verify table created (Table Editor → health_journeys)
- [ ] Go to Settings → API
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Add to `.env`:
  ```bash
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```

### Step 4: Verify Installation

- [ ] Restart dev server:
  ```bash
  npm run dev
  ```
- [ ] Open browser console
- [ ] Check for PostHog message (if configured):
  ```
  ✓ "PostHog initialized successfully"
  ```
- [ ] Check for Supabase message (if configured):
  ```
  ✓ "Supabase client initialized successfully"
  ```

### Step 5: Test PostHog (If Configured)

- [ ] Open app in browser
- [ ] Click "Begin Your Ascent"
- [ ] Navigate through a few steps
- [ ] Go to PostHog dashboard → Activity
- [ ] Verify events are appearing:
  - [ ] `journey_started`
  - [ ] `step_viewed`
  - [ ] Page views

### Step 6: Test Supabase (If Configured)

- [ ] Open app in browser
- [ ] Click "Begin Your Ascent"
- [ ] Fill in some form fields
- [ ] Wait 2 seconds (for auto-save)
- [ ] Go to Supabase dashboard → Table Editor → health_journeys
- [ ] Verify data is saved:
  - [ ] Row exists
  - [ ] `form_data` contains your input
  - [ ] `current_step` is correct
- [ ] Refresh browser page
- [ ] Verify data reloads automatically

### Step 7: Test Both Together (If Both Configured)

- [ ] Complete a journey step
- [ ] Check PostHog for `journey_saved` event
- [ ] Check Supabase for saved data
- [ ] Verify both services working together

## 🔍 Troubleshooting Checklist

### PostHog Not Working?

- [ ] API key starts with `phc_`
- [ ] API key is in `.env` file
- [ ] Dev server restarted after adding env vars
- [ ] No console errors
- [ ] Waited 30 seconds for events to appear
- [ ] Checked correct PostHog project

### Supabase Not Working?

- [ ] SQL schema ran successfully
- [ ] Both URL and anon key in `.env`
- [ ] Dev server restarted after adding env vars
- [ ] No console errors
- [ ] Table `health_journeys` exists
- [ ] RLS policies created
- [ ] Checked correct Supabase project

### Data Not Saving?

- [ ] Supabase configured (see above)
- [ ] No errors in browser console
- [ ] Waited 1+ seconds after input
- [ ] Table has correct schema
- [ ] RLS policies allow anonymous access

### Data Not Loading?

- [ ] Supabase configured (see above)
- [ ] Data exists in Supabase table
- [ ] Session ID matches (check localStorage)
- [ ] No errors in browser console

## 📚 Documentation Reference

### Quick Guides
- [ ] Read `QUICK_START.md` for fast setup
- [ ] Read `INSTALLATION_SUMMARY.md` for overview

### Detailed Guides
- [ ] Read `POSTHOG_SETUP.md` for PostHog details
- [ ] Read `SUPABASE_SETUP.md` for Supabase details
- [ ] Read `INTEGRATION_GUIDE.md` for comprehensive info

### Technical Reference
- [ ] Read `ARCHITECTURE.md` for system design
- [ ] Check `README.md` for general app info

## 🎯 Success Criteria

### Minimum (No Integration)
- [x] App runs without errors
- [x] Forms work correctly
- [x] Data saved in localStorage

### With PostHog
- [ ] Events tracked in PostHog dashboard
- [ ] Session recordings available
- [ ] No console errors

### With Supabase
- [ ] Data saved to database
- [ ] Data loads on refresh
- [ ] Cross-device sync works

### With Both
- [ ] All PostHog events tracked
- [ ] All data persisted to Supabase
- [ ] Save events tracked in PostHog
- [ ] Complete user journey tracked

## 🚀 Production Checklist

### Before Deploying

- [ ] Test app thoroughly
- [ ] Verify all integrations work
- [ ] Check console for errors
- [ ] Test on multiple devices
- [ ] Test on multiple browsers

### Deployment

- [ ] Build succeeds: `npm run build`
- [ ] Set environment variables in hosting platform
- [ ] Deploy to hosting platform
- [ ] Verify production URLs work
- [ ] Test production app

### Post-Deployment

- [ ] Check PostHog for production events
- [ ] Check Supabase for production data
- [ ] Monitor error logs
- [ ] Set up alerts (optional)
- [ ] Create dashboards (optional)

## 📊 Monitoring Checklist

### PostHog Monitoring

- [ ] Create funnel for journey completion
- [ ] Create insight for step engagement
- [ ] Set up alert for drop in traffic
- [ ] Review session recordings weekly
- [ ] Check for error patterns

### Supabase Monitoring

- [ ] Check database size weekly
- [ ] Review API logs for errors
- [ ] Monitor query performance
- [ ] Check for failed saves
- [ ] Verify RLS policies working

## 🔒 Security Checklist

- [ ] `.env` file in `.gitignore`
- [ ] No API keys in code
- [ ] Supabase RLS enabled
- [ ] PostHog input masking enabled
- [ ] No PII in event properties
- [ ] Environment variables in hosting platform
- [ ] Regular security audits

## 💡 Optimization Checklist

### Performance

- [ ] Auto-save debounced (1 second)
- [ ] No unnecessary re-renders
- [ ] Build size acceptable (<1MB)
- [ ] Page load time <3 seconds

### User Experience

- [ ] Data saves automatically
- [ ] Data loads on refresh
- [ ] No blocking operations
- [ ] Error messages helpful
- [ ] Loading states clear

### Analytics

- [ ] Key events tracked
- [ ] Funnels set up
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Regular review scheduled

## ✨ Next Steps

After completing setup:

- [ ] Share app with test users
- [ ] Gather feedback
- [ ] Review analytics data
- [ ] Optimize based on insights
- [ ] Plan new features
- [ ] Consider adding authentication
- [ ] Consider adding email notifications

## 📝 Notes

Use this space for your own notes:

```
PostHog Project: _________________
PostHog API Key: phc_____________

Supabase Project: ________________
Supabase URL: https://____________
Supabase Key: eyJ________________

Deployment URL: __________________

Issues encountered:
- 
- 
- 

Solutions:
- 
- 
- 
```

## 🎉 Completion

When all checkboxes are complete:

- [ ] PostHog tracking working
- [ ] Supabase persistence working
- [ ] App deployed to production
- [ ] Documentation reviewed
- [ ] Team trained (if applicable)
- [ ] Monitoring set up
- [ ] Ready for users!

---

**Congratulations!** Your Health Summit app now has world-class analytics and data persistence. 🚀
