-- Make name column nullable for OAuth users (Apple, Google)
-- OAuth providers don't always provide the user's name, especially Apple
-- on subsequent sign-ins or when users choose not to share

-- Remove NOT NULL constraint from name column
ALTER TABLE user_profiles 
ALTER COLUMN name DROP NOT NULL;

-- Set a default value for existing NULL names
ALTER TABLE user_profiles 
ALTER COLUMN name SET DEFAULT 'User';

-- Update any existing NULL names to a default value
UPDATE user_profiles 
SET name = 'User'
WHERE name IS NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN user_profiles.name IS 
'User display name. Can be NULL for OAuth users (Apple/Google) who do not share their name. Defaults to ''User'' if not provided.';








