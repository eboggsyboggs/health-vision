-- Add new fields to profiles table for SMS consent and user info
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pilot_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Chicago';

-- Update existing profiles to mark as incomplete if they don't have required fields
UPDATE profiles
SET profile_completed = false
WHERE first_name IS NULL OR last_name IS NULL OR phone IS NULL OR sms_opt_in IS NULL;

-- Create index for faster profile completion checks
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(profile_completed);
