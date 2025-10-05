# 🚀 How to Run Supabase Migrations

## Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

## Step 2: Run Migration Files (in order)

### Migration 1: Add Premium Access Column
**File:** `supabase/migrations/20251003_add_premium_access.sql`

1. Click **"New Query"**
2. Copy the entire contents of the file
3. Paste into the SQL editor
4. Click **"Run"** (or press Cmd+Enter)
5. ✅ You should see: "Success. No rows returned"

---

### Migration 2: Sync Verified Users
**File:** `supabase/migrations/20251004_sync_verified_users.sql`

1. Click **"New Query"**
2. Copy the entire contents of the file
3. Paste into the SQL editor
4. Click **"Run"** (or press Cmd+Enter)
5. ✅ You should see: "Migration complete! Total verified users in user_profiles: X"

---

## Step 3: Verify Results

### Check User Profiles Table
```sql
SELECT 
  id,
  email,
  has_premium_access,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
```

You should see:
- ✅ All verified users from `auth.users`
- ✅ `has_premium_access` = `FALSE` for everyone
- ✅ Only users with verified emails

---

## Step 4: Grant Premium Access to Beta Users

### Option A: Grant to specific users by email
```sql
UPDATE user_profiles 
SET has_premium_access = TRUE 
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN (
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  )
);
```

### Option B: Grant to all existing users
```sql
UPDATE user_profiles 
SET has_premium_access = TRUE 
WHERE created_at < '2025-10-04';  -- Before paywall was added
```

### Option C: Grant to yourself
```sql
UPDATE user_profiles 
SET has_premium_access = TRUE 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

---

## ✅ Done!

Your app now:
- ✅ Only creates profiles for VERIFIED users
- ✅ All existing verified users are synced
- ✅ You can manually grant free access via database flag
- ✅ New users see the paywall (unless you grant them access)

---

## 🧪 Test Your Setup

1. **Existing user with premium flag:** Should skip paywall
2. **New user without flag:** Should see paywall
3. **Email signup:** Profile created AFTER verification
4. **OAuth signup:** Profile created immediately (already verified)


