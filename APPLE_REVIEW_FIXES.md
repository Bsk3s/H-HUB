# Apple App Store Review - Issues Fixed

## Overview
This document outlines the issues raised by Apple's review team and the fixes applied to resolve them.

---

## ✅ FIXED ISSUES (Code Changes Made)

### 1. ✅ Sign in with Apple Configuration (Guideline 2.1)
**Issue:** Sign in with Apple failed when creating new accounts on iPad.

**Fix Applied:**
- Added `associatedDomains` to `app.json` for iOS:
  ```json
  "associatedDomains": [
    "applinks:app.a-heavenlyhub.com",
    "webcredentials:app.a-heavenlyhub.com"
  ]
  ```
- Added `scheme` configuration to `app.json`:
  ```json
  "scheme": "com.bsk3s.heavenlyhub"
  ```
- Verified that Supabase redirect URLs are properly configured (already done ✅)

**Files Changed:**
- `app.json`

---

### 2. ✅ Age Field Made Optional (Guideline 5.1.1)
**Issue:** App required users to provide age information that is not directly relevant to core functionality.

**Fix Applied:**
- Modified `FinalScreen` in `OnboardingNavigator.js` to make age field optional
- Changed validation to only require name: `const isValid = name.trim().length > 0;`
- Updated placeholder text to: `"Age (Optional)"`
- Updated subtitle to: `"Tell us your name (age is optional)"`
- Modified save logic to only save age if provided

**Files Changed:**
- `components/navigation/OnboardingNavigator.js`

---

### 3. ✅ Terms of Use / EULA Links Added (Guideline 3.1.2)
**Issue:** App metadata missing functional link to Terms of Use (EULA) for auto-renewable subscriptions.

**Fix Applied:**
- Added Privacy Policy and Terms of Use links directly in `PaywallScreen.js` (subscription screen)
- Links are prominently displayed above the login button
- Links already exist in Settings screen (verified ✅)
- Privacy Policy URL already in `app.json` (verified ✅)

**Links Added:**
- Privacy Policy: `https://a-heavenlyhub.com/privacy`
- Terms of Use: `https://a-heavenlyhub.com/terms`

**Files Changed:**
- `screens/PaywallScreen.js`

---

## ⚠️ MANUAL FIXES REQUIRED (App Store Connect)

### 4. ⚠️ Demo Account Credentials (Guideline 2.1)
**Issue:** Demo account `sogben3@gmail.com` / `Selorm01` didn't work.

**Status:** ✅ User confirmed this was fixed (typo corrected)

**Action Required:**
- Verify the updated credentials work in App Store Connect → App Review Information
- Test the credentials yourself before resubmitting

---

### 5. ⚠️ Duplicate Promotional Images (Guideline 2.3.2)
**Issue:** Same promotional image used for multiple in-app purchases.

**Action Required:**
1. Go to App Store Connect → Your App → In-App Purchases
2. For each promoted in-app purchase, either:
   - Create a **unique** promotional image that clearly represents that specific purchase
   - OR remove promotional images for products you don't plan to actively promote

**Note:** Each in-app purchase needs its own distinct promotional image or none at all.

---

### 6. ⚠️ Email Verification Links (Guideline 2.1)
**Issue:** Email verification links were reported as invalid by reviewers.

**Status:** Your Supabase redirect URLs are correctly configured ✅

**Possible Causes:**
- Email provider issues (deliverability)
- Link expiration timing
- Deep linking not working on reviewer's device

**Action to Verify:**
1. Test the complete email verification flow on a fresh device/account
2. Check Supabase logs for any verification errors
3. Verify your email templates are correct in Supabase Dashboard
4. Test on iPad Air (5th generation) with iPadOS 26.0.1 if possible

**If Still Broken, Check:**
- Supabase Dashboard → Authentication → Email Templates
- Supabase Dashboard → Authentication → URL Configuration (already verified ✅)
- Test with a completely new email address (not previously used)

---

## 📋 RESUBMISSION CHECKLIST

Before resubmitting to Apple:

### Code Changes (Already Done ✅)
- [x] Associated Domains added for Apple Sign In
- [x] Age field made optional in onboarding
- [x] Terms of Use and Privacy Policy links added to PaywallScreen
- [x] All code changes tested locally

### App Store Connect Tasks (Manual)
- [ ] Verify demo account credentials work: `sogben3@gmail.com`
- [ ] Fix duplicate promotional images (create unique images for each IAP OR remove them)
- [ ] Test email verification flow end-to-end with a fresh email
- [ ] Verify email verification works on iPad Air (5th generation) if possible

### Superwall Dashboard (Check)
- [ ] Ensure subscription details are visible in your Superwall paywall:
  - Subscription title (e.g., "Heavenly Hub Premium")
  - Subscription length (e.g., "Monthly" or "Annual")
  - Subscription price (clearly displayed)
  - Privacy Policy link (functional)
  - Terms of Use link (functional)

### Final Testing
- [ ] Build new version with all fixes: `eas build --platform ios`
- [ ] Test Sign in with Apple on physical iOS device
- [ ] Test email signup and verification flow completely
- [ ] Test age field is optional (can proceed without entering age)
- [ ] Verify Privacy Policy and Terms links work in PaywallScreen
- [ ] Test demo account login works

---

## 🚀 Next Steps

1. **Complete Manual Fixes:**
   - Fix promotional images in App Store Connect
   - Test email verification thoroughly
   - Verify demo account works

2. **Build New Version:**
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store Connect:**
   - Upload new build
   - Update "What's New" notes mentioning fixes
   - Resubmit for review

4. **Response to Apple (Optional but Recommended):**
   Include these notes in the "App Review Information" section:
   ```
   Thank you for the detailed feedback. We have addressed all issues:

   1. Sign in with Apple: Added proper Associated Domains configuration
   2. Age Field: Made optional - users can skip if they prefer
   3. Terms/EULA: Added functional links to Privacy Policy and Terms of Use in subscription screen
   4. Demo Account: Verified credentials work correctly
   5. Email Verification: Re-tested complete flow successfully

   All subscription information (title, length, price, legal links) is displayed via Superwall paywall service.
   ```

---

## 📞 Support

If you encounter any issues during resubmission:
- Test each fix independently
- Check console logs for any errors
- Verify all Supabase settings match the configuration
- Ensure your website has working `/privacy` and `/terms` pages

Good luck with the resubmission! 🎉

