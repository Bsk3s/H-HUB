-- Add premium access column to user_profiles table
-- This allows admins to manually grant free access to specific users

-- Add the column (defaults to false for all existing users)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT FALSE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium_access 
ON user_profiles(has_premium_access);

-- Add a comment explaining the column
COMMENT ON COLUMN user_profiles.has_premium_access IS 
'Admin-controlled flag to grant free premium access. TRUE = user has access without Superwall subscription. FALSE = user must subscribe via Superwall.';

-- Optional: Set your own account to have premium access
-- Replace 'your-email@example.com' with your actual email
-- UPDATE user_profiles 
-- SET has_premium_access = TRUE 
-- WHERE email = 'your-email@example.com';



