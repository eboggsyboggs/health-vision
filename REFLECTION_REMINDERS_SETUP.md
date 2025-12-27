# Sunday Reflection Reminders Setup

This document describes the setup for automated Sunday reflection reminders via SMS.

## Overview

Every Sunday at 6:00 PM UTC (12:00 PM CST), the system checks which users haven't completed their weekly reflection and sends them a personalized SMS reminder with a link to the app.

## Features

- **Automatic Detection**: Identifies users who haven't completed their reflection for the current week
- **SMS Reminders**: Sends personalized SMS with link to dashboard
- **Deduplication**: Prevents sending multiple reminders on the same day
- **Logging**: All attempts logged to `sms_reminders` table

## Setup Steps

### 1. Deploy Edge Function

Deploy the `send-reflection-reminders` function to Supabase:

```bash
# Using Supabase CLI
supabase functions deploy send-reflection-reminders
```

Or manually via Supabase Dashboard:
1. Go to Edge Functions → Create new function
2. Name: `send-reflection-reminders`
3. Paste code from `supabase/functions/send-reflection-reminders/index.ts`
4. Deploy

### 2. Set Up Cron Job

Run the SQL in `supabase/cron_reflection_reminders.sql` in the Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'send-sunday-reflection-reminders',
  '0 18 * * 0', -- Every Sunday at 6:00 PM UTC
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reflection-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Important**: Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

### 3. Verify Environment Variables

The function uses the same environment variables as habit reminders:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These should already be configured in Supabase → Settings → Edge Functions → Secrets.

## How It Works

### Timing
- **Cron Schedule**: Every Sunday at 6:00 PM UTC (12:00 PM CST)
- **Day Check**: Function verifies it's Sunday (day 0) before proceeding

### Logic Flow
1. Check if today is Sunday
2. Get current week number (based on pilot start date: Jan 6, 2025)
3. Fetch all users with SMS consent (`sms_opt_in = true`)
4. Query `weekly_reflections` table for current week
5. Identify users who haven't completed their reflection
6. Send SMS reminder to each user (if not already sent today)
7. Log all attempts to `sms_reminders` table

### Message Format
```
Hi [FirstName]! 🏔️ It's the last day of the week - take a moment to reflect on your progress and plan for next week: https://health-vision-pi.vercel.app/dashboard
```

### Database Schema

The function uses existing tables:
- `profiles`: User info and SMS consent
- `weekly_reflections`: Completed reflections
- `sms_reminders`: Logging (with `habit_id = null` for reflection reminders)

## Testing

### Manual Test
Trigger the function manually via Supabase Dashboard:
1. Go to Edge Functions → `send-reflection-reminders`
2. Click "Test" button
3. Check logs for output

Or via curl:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reflection-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### SQL Test
Create a test scenario:
```sql
-- 1. Ensure you have SMS consent
UPDATE profiles 
SET sms_opt_in = true, phone = '+1234567890'
WHERE id = 'YOUR_USER_ID';

-- 2. Delete your reflection for current week (if exists)
DELETE FROM weekly_reflections 
WHERE user_id = 'YOUR_USER_ID' 
AND week_number = (SELECT FLOOR((EXTRACT(EPOCH FROM (NOW() - '2025-01-06'::date)) / 86400) / 7) + 1);

-- 3. Manually trigger the function (see above)

-- 4. Check the SMS reminder was logged
SELECT * FROM sms_reminders 
WHERE user_id = 'YOUR_USER_ID' 
AND habit_id IS NULL
ORDER BY created_at DESC 
LIMIT 1;
```

## Monitoring

### Check Cron Job Status
```sql
SELECT * FROM cron.job WHERE jobname = 'send-sunday-reflection-reminders';
```

### View Recent Runs
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-sunday-reflection-reminders')
ORDER BY start_time DESC 
LIMIT 10;
```

### Check Reflection Reminders Sent
```sql
SELECT 
  sr.user_id,
  p.first_name,
  p.email,
  sr.message,
  sr.status,
  sr.sent_at
FROM sms_reminders sr
JOIN profiles p ON sr.user_id = p.id
WHERE sr.habit_id IS NULL  -- Reflection reminders
ORDER BY sr.sent_at DESC;
```

## Troubleshooting

### No Reminders Sent
1. Check if it's Sunday: Function only runs on day 0
2. Verify users have `sms_opt_in = true`
3. Check if users already completed their reflection
4. Verify Twilio credentials are correct
5. Check Edge Function logs for errors

### Duplicate Reminders
The function checks for existing reminders sent today before sending. If duplicates occur:
1. Check the deduplication query in the code
2. Verify `sent_at` timestamps are correct

### Wrong Week Number
The week number is calculated from pilot start date (Jan 6, 2025). If incorrect:
1. Verify the `pilotStartDate` in the function code
2. Check the `getCurrentWeekNumber()` function logic

## Cost Estimates

- **Edge Function**: Free (within Supabase limits)
- **SMS**: ~$0.0075 per message (Twilio pricing)
- **Frequency**: Once per week per user (Sundays only)
- **Example**: 100 users = $0.75/week = ~$3/month

## Production Checklist

- [ ] Edge Function deployed
- [ ] Cron job scheduled
- [ ] Environment variables configured
- [ ] Twilio toll-free number verified
- [ ] Test reminder sent successfully
- [ ] Monitoring queries saved
- [ ] Team notified of Sunday reminder schedule

## Future Enhancements

- [ ] Personalize message based on user's progress
- [ ] Allow users to customize reminder time
- [ ] Add option to disable reflection reminders
- [ ] Send reminder earlier in the day (e.g., morning)
- [ ] Include week number in message
