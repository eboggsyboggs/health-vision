-- Cron job to send Sunday reflection reminders
-- Runs every Sunday at 6:00 PM UTC (12:00 PM CST)

SELECT cron.schedule(
  'send-sunday-reflection-reminders',
  '0 18 * * 0', -- Every Sunday at 6:00 PM UTC
  $$
  SELECT
    net.http_post(
      url:='https://oxszevplpzmzmeibjtdz.supabase.co/functions/v1/send-reflection-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To check if the cron job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'send-sunday-reflection-reminders';

-- To unschedule the cron job (if needed):
-- SELECT cron.unschedule('send-sunday-reflection-reminders');
