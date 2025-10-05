-- Sync all verified users from auth.users to user_profiles table
-- Only creates profiles for users with verified emails
-- Does NOT grant premium access (defaults to FALSE)

-- Insert verified users who don't have profiles yet
INSERT INTO user_profiles (id, has_premium_access)
SELECT 
  au.id,
  FALSE  -- Default to no premium access
FROM auth.users au
WHERE 
  -- Only verified users
  au.email_confirmed_at IS NOT NULL
  -- Only if they don't already have a profile
  AND NOT EXISTS (
    SELECT 1 
    FROM user_profiles up 
    WHERE up.id = au.id
  );

-- Log the result
DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count
  FROM auth.users au
  WHERE au.email_confirmed_at IS NOT NULL
    AND EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = au.id);
  
  RAISE NOTICE 'Migration complete! Total verified users in user_profiles: %', synced_count;
END $$;


