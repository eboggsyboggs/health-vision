# Supabase Backend Setup Guide

This guide will help you set up Supabase as the backend for the Health Summit app.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your app's `.env` file

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Health Summit (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

3. Add these to your `.env` file:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste the following SQL and click "Run":

```sql
-- Create health_journeys table
CREATE TABLE health_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_step TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_health_journeys_session_id ON health_journeys(session_id);
CREATE INDEX idx_health_journeys_user_id ON health_journeys(user_id);
CREATE INDEX idx_health_journeys_created_at ON health_journeys(created_at DESC);

-- Enable Row Level Security
ALTER TABLE health_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users (by session_id)
CREATE POLICY "Users can view their own journeys by session"
  ON health_journeys FOR SELECT
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
         OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can insert their own journeys"
  ON health_journeys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own journeys by session"
  ON health_journeys FOR UPDATE
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
         OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can delete their own journeys by session"
  ON health_journeys FOR DELETE
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
         OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view their own journeys"
  ON health_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own journeys"
  ON health_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own journeys"
  ON health_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_health_journeys_updated_at
  BEFORE UPDATE ON health_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: (Optional) Enable Realtime

If you want real-time updates (useful for multi-device sync):

1. Go to **Database** → **Replication**
2. Find the `health_journeys` table
3. Toggle "Enable Realtime" to ON

## Step 5: Test Your Setup

1. Restart your development server:
```bash
npm run dev
```

2. Open the app and complete a journey step
3. Check your Supabase dashboard:
   - Go to **Table Editor** → **health_journeys**
   - You should see your journey data saved!

## Features Enabled

With Supabase configured, your app now has:

- ✅ **Automatic data persistence** - Journey data is saved as users progress
- ✅ **Cross-device sync** - Users can continue on different devices
- ✅ **Data recovery** - Users can reload their progress if they close the browser
- ✅ **Analytics integration** - Journey saves are tracked in PostHog
- ✅ **Future authentication** - Ready to add user accounts when needed

## Troubleshooting

### "Supabase not configured" warning
- Make sure your `.env` file has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### Data not saving
- Check the browser console for errors
- Verify your RLS policies are set up correctly
- Make sure the table was created successfully

### Can't see data in Supabase
- Check that you're looking at the correct project
- Verify the table name is `health_journeys`
- Check the SQL Editor for any error messages

## Security Notes

- The `anon` key is safe to expose in your frontend code
- Row Level Security (RLS) ensures users can only access their own data
- For production, consider adding rate limiting and additional security measures
- Never commit your `.env` file to version control

## Next Steps

Consider adding:
- User authentication (Supabase Auth)
- Email notifications for journey completion
- Data export functionality
- Journey templates and sharing
- Progress analytics and insights
