# 🧪 App Testing Guide - After RLS Security Fix

## ✅ What Was Fixed

We applied critical security patches that:
1. ✅ Fixed `user_complete_profile` view exposing sensitive auth.users data
2. ✅ Enabled RLS on `conversation_sessions`, `conversation_turns`, `daily_progress`
3. ✅ Added comprehensive RLS policies to ALL user data tables
4. ✅ Fixed SECURITY DEFINER vulnerability
5. ✅ Locked down function security (search_path)
6. ✅ Revoked all anon access to sensitive data

---

## 🧪 Quick Manual Test Checklist

### Test 1: User Authentication & Profile ✅
**What to test:**
- [ ] User can sign in successfully
- [ ] User can view their own profile
- [ ] User can update their profile (name, age, etc.)

**Expected behavior:**
- ✅ All profile operations should work normally
- ✅ Users should ONLY see their own profile data

**If it breaks:**
- Error message will mention "RLS" or "permission denied"
- This means the RLS policy needs adjustment

---

### Test 2: Onboarding Flow ✅
**What to test:**
- [ ] New user can complete onboarding
- [ ] Onboarding data is saved correctly
- [ ] `getCompleteUserProfile()` still works

**Expected behavior:**
- ✅ Onboarding should complete normally
- ✅ Data saves to `user_onboarding_data` table

**Files affected:**
- `src/auth/services/onboarding-service.js` (line 76-95)
- Uses `user_complete_profile` view

---

### Test 3: Conversation/Voice Chat ✅
**What to test:**
- [ ] User can start a voice conversation
- [ ] Conversation sessions are created
- [ ] Conversation turns are logged
- [ ] User can view their conversation history

**Expected behavior:**
- ✅ All conversation features work normally
- ✅ Users can ONLY see their own conversations

**If it breaks:**
- Check if you're trying to access conversations without authentication
- Ensure `user_id` is set correctly when creating sessions/turns

---

### Test 4: Activities & Progress Tracking ✅
**What to test:**
- [ ] User can log activities (reading, prayer, etc.)
- [ ] Daily progress is tracked
- [ ] Activity logs are saved
- [ ] User can view their streaks and progress

**Expected behavior:**
- ✅ All activity tracking works normally
- ✅ Users can ONLY see their own activities

**Files affected:**
- `src/services/activities.js`
- `activities.js`

---

### Test 5: Notes & Folders ✅
**What to test:**
- [ ] User can create folders
- [ ] User can create notes
- [ ] User can view their notes
- [ ] User can update/delete notes

**Expected behavior:**
- ✅ All note operations work normally
- ✅ Users can ONLY see their own notes and folders

---

## 🔧 Running Automated Tests

### Option 1: RLS Security Test (Recommended)

```bash
# Install dependencies if needed
npm install dotenv

# Create a .env file with test users
echo "TEST_USER_1_EMAIL=yourtestemail1@example.com" >> .env
echo "TEST_USER_1_PASSWORD=yourpassword" >> .env

# Run the test
node test-rls-security.js
```

**Expected output:**
```
✅ Passed: 6
❌ Failed: 0
🎉 ALL TESTS PASSED!
```

---

## 🚨 Common Issues & Fixes

### Issue 1: "permission denied for table"
**Cause:** User doesn't have permission to access the table
**Fix:** The RLS policies are working correctly - check if:
- User is authenticated (`auth.uid()` is not null)
- The query includes correct `user_id` filter

### Issue 2: "new row violates row-level security policy"
**Cause:** Trying to insert data with wrong `user_id`
**Fix:** Ensure `user_id` matches the authenticated user's ID
```javascript
// ✅ Correct
const { data, error } = await supabase
  .from('notes')
  .insert({
    user_id: user.id,  // Must match authenticated user
    title: 'My Note',
    content: {}
  });

// ❌ Wrong
const { data, error } = await supabase
  .from('notes')
  .insert({
    user_id: 'some-other-user-id',  // Will fail!
    title: 'My Note'
  });
```

### Issue 3: "Cannot read properties of null (reading 'id')"
**Cause:** User is not authenticated when trying to access data
**Fix:** Ensure user is logged in before querying
```javascript
// ✅ Correct
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.error('User not authenticated');
  return;
}

const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id);
```

### Issue 4: `user_complete_profile` returns null
**Cause:** The view now only returns data from `user_profiles`, not `auth.users`
**Fix:** This is expected - the view no longer exposes sensitive auth.users data

**Before (INSECURE):**
```javascript
// Used to return email, phone, etc. from auth.users ❌
const profile = await getCompleteUserProfile(userId);
// profile.email ← No longer available (GOOD!)
```

**After (SECURE):**
```javascript
// Now only returns: id, name, role, speech_time, age ✅
const profile = await getCompleteUserProfile(userId);
// profile.email ← undefined (expected)

// To get email, use auth.user object instead:
const { data: { user } } = await supabase.auth.getUser();
const email = user.email; // ✅
```

---

## 📊 What Data Users Can See

### ✅ Users CAN see (their own):
- Their profile (name, age, role, speech_time)
- Their folders and notes
- Their conversation sessions and turns
- Their activities and progress
- Their onboarding data
- Their subscription/payment info

### ❌ Users CANNOT see:
- Other users' profiles
- Other users' conversations
- Other users' notes
- Other users' activities
- Email/phone from other users
- Admin/system data

### 🚫 Anonymous users CANNOT see:
- ANY user profiles
- ANY conversations
- ANY notes
- ANY activities
- ANYTHING sensitive

---

## 🔍 Debugging Tips

### Check if RLS is working:
```javascript
// Test 1: Try to access all profiles
const { data, error } = await supabase
  .from('user_profiles')
  .select('*');

console.log('Rows returned:', data?.length);
// Should return: 1 (only your own profile)

// Test 2: Try to access all conversations
const { data: convos, error: err } = await supabase
  .from('conversation_sessions')
  .select('*');

console.log('Conversations returned:', convos?.length);
// Should only return YOUR conversations
```

### Check current user:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id, user?.email);
// Should show your logged-in user, or null if not logged in
```

### Check RLS policies in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/ocmhylirrfijyosxwtph/auth/policies
2. Verify policies exist for all tables
3. Check policy definitions match expected behavior

---

## ✅ Success Criteria

Your app is working correctly if:
- ✅ Users can sign in and access their own data
- ✅ Users CANNOT see other users' data
- ✅ Anonymous users CANNOT access any sensitive data
- ✅ All existing app features work normally
- ✅ The RLS test script passes all tests

---

## 🆘 Need Help?

If tests fail or app breaks:
1. Check the error message - it usually says what's wrong
2. Verify user is authenticated before queries
3. Ensure `user_id` fields are set correctly
4. Run the `test-rls-security.js` script to pinpoint issues
5. Check Supabase logs: Dashboard → Logs → Postgres

---

## 📝 Next Steps

After testing:
- [ ] Verify all app features work
- [ ] Run the automated RLS test
- [ ] Fix remaining warnings in Supabase Dashboard:
  - Enable leaked password protection
  - Reduce OTP expiry time
  - Schedule Postgres upgrade
- [ ] Monitor app for any permission errors
- [ ] Consider adding integration tests to CI/CD

---

**Last Updated:** 2025-09-30
**Migration Applied:** `critical_security_fix_auth_exposure_and_rls`
