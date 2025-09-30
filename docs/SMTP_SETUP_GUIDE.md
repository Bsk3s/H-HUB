# 📧 SMTP Setup Guide for Heavenly Hub

## Step-by-Step: Resend + Supabase SMTP Configuration

---

## Part 1: Create Resend Account

### 1. Sign Up for Resend
1. Go to: https://resend.com
2. Click "Get Started"
3. Sign up with your email
4. Verify your email

### 2. Add Your Domain (Important!)
**Why:** So emails come from `noreply@heavenlyhub.com` instead of `noreply@resend.dev`

1. In Resend Dashboard → Click "Domains"
2. Click "Add Domain"
3. Enter your domain: `heavenlyhub.com`
4. Resend will show you DNS records to add

### 3. Configure DNS Records
You need to add these to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.):

**Example DNS Records (Resend will give you exact values):**
```
Type: TXT
Host: _resend
Value: resend-verify=xyz123...
TTL: 3600

Type: MX
Host: heavenlyhub.com
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Host: heavenlyhub.com
Value: v=spf1 include:spf.resend.com ~all
```

**Wait:** DNS propagation can take 5 minutes to 24 hours (usually 10 minutes)

### 4. Get SMTP Credentials
1. In Resend Dashboard → Click "SMTP"
2. You'll see:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend`
   - **Password:** Click "Generate API Key" → Copy this!

**IMPORTANT:** Save these credentials securely!

---

## Part 2: Configure Supabase

### 1. Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/ocmhylirrfijyosxwtph
2. Click "Settings" (left sidebar, near bottom)
3. Click "Auth" tab
4. Scroll down to "SMTP Settings"

### 2. Enable Custom SMTP
1. Toggle "Enable Custom SMTP" → ON
2. Fill in the form:

```
Sender Email: noreply@heavenlyhub.com
Sender Name: Heavenly Hub

SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP Username: resend
SMTP Password: [Your Resend API Key]

SMTP Connection: SSL/TLS
```

3. Click "Save"

### 3. Test the Configuration
1. Scroll to bottom of SMTP Settings
2. Click "Send Test Email"
3. Enter your personal email
4. Check your inbox!

✅ **If you receive the email:** Success! You're done!
❌ **If not:** Check the error message and verify credentials

---

## Part 3: Configure Email Templates

### 1. Go to Email Templates
1. Still in Supabase Dashboard → Auth
2. Click "Email Templates" tab
3. You'll see:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 2. Customize "Confirm Signup" Template

**Click "Confirm signup" → Edit**

**Important Variables:**
- `{{ .ConfirmationURL }}` - The verification link
- `{{ .SiteURL }}` - Your app URL
- `{{ .Email }}` - User's email

**Basic Template (we'll make it beautiful later):**

```html
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px;">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #4A5568; margin: 0;">🙏 Heavenly Hub</h1>
    </div>

    <!-- Main Content -->
    <div style="text-align: center;">
      <h2 style="color: #2D3748; margin-bottom: 20px;">Verify Your Email</h2>
      
      <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
        Welcome! Click the button below to verify your email address and 
        start your spiritual journey with Heavenly Hub.
      </p>

      <!-- CTA Button -->
      <div style="margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #4F46E5; color: white; padding: 15px 40px; 
                  text-decoration: none; border-radius: 8px; font-size: 16px; 
                  font-weight: bold; display: inline-block;">
          Verify My Account
        </a>
      </div>

      <!-- Fallback Link -->
      <p style="color: #718096; font-size: 14px;">
        Or copy this link:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #4F46E5; word-break: break-all;">
          {{ .ConfirmationURL }}
        </a>
      </p>

      <!-- Expiry Notice -->
      <p style="color: #A0AEC0; font-size: 12px; margin-top: 30px;">
        This link expires in 24 hours for security reasons.
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center;">
      <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
        Sent by Heavenly Hub<br>
        Need help? Reply to this email or visit our support page.
      </p>
    </div>

  </div>
</body>
</html>
```

**Click "Save"**

---

## Part 4: Configure Deep Link Redirect

### 1. Set Redirect URL
Still in Email Templates, look for "Redirect URLs" section

**Add your app's deep link:**
```
heavenlyhub://verify
```

Or if using custom domain:
```
https://app.heavenlyhub.com/verify
```

This is where users land AFTER clicking the verification link.

---

## Part 5: Test the Full Flow

### 1. Create Test Account
1. Open your app
2. Sign up with a NEW email (use your personal email for testing)
3. Watch what happens!

### 2. Check Email
1. Open your inbox
2. Find the "Verify Your Email" message
3. Check:
   - ✅ Comes from noreply@heavenlyhub.com (not resend.dev)
   - ✅ Template looks good
   - ✅ Button works
   - ✅ Link redirects to app

### 3. Verify in App
1. Click the verification link
2. Should open your app
3. App should show "Verified!" screen
4. User should be logged in

---

## Troubleshooting

### Email Not Received
**Check:**
- ✅ Spam folder
- ✅ DNS records are correct (Resend dashboard shows status)
- ✅ SMTP credentials are correct in Supabase
- ✅ "Enable Custom SMTP" is ON
- ✅ Test email worked

### Email Comes from resend.dev
**Problem:** Domain not verified yet
**Solution:** Wait for DNS propagation (check Resend domain status)

### Link Doesn't Open App
**Problem:** Deep link not configured
**Solution:** 
1. Check app.json has correct scheme
2. Verify redirect URL in Supabase matches your scheme
3. Test deep link manually: `npx uri-scheme open heavenlyhub://verify --ios`

### Template Looks Broken
**Problem:** Email clients render HTML differently
**Solution:**
- Use tables for layout (old school but works)
- Inline CSS (no external stylesheets)
- Test on multiple clients (Gmail, Apple Mail, Outlook)

---

## Alternative: Quick Start with SendGrid

If you prefer SendGrid:

### 1. Sign Up
- Go to: https://sendgrid.com
- Create account
- Verify email

### 2. Get API Key
- Settings → API Keys → Create API Key
- Choose "Full Access"
- Copy the key!

### 3. Supabase Settings
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
```

### 4. Verify Domain
- Settings → Sender Authentication → Authenticate Your Domain
- Follow DNS instructions

---

## Cost Comparison

### For 10,000 emails/month:

| Provider | Cost | Features |
|----------|------|----------|
| Resend | $20/mo | Modern UI, React templates |
| SendGrid | $20/mo | Robust, industry standard |
| Mailgun | $35/mo | Good analytics |
| AWS SES | $1/mo | Cheapest, but complex |

### For 100,000 emails/month:

| Provider | Cost |
|----------|------|
| Resend | $50/mo |
| SendGrid | $90/mo |
| Mailgun | $80/mo |
| AWS SES | $10/mo |

---

## Security Best Practices

1. **API Keys:**
   - Never commit to Git
   - Store in Supabase dashboard only
   - Rotate every 90 days

2. **Domain Authentication:**
   - Always verify your domain
   - Set up DKIM, SPF, DMARC
   - Improves deliverability

3. **Rate Limiting:**
   - Set up sending limits
   - Monitor for abuse
   - Use Supabase rate limiting

4. **Email Content:**
   - No spam words ("free", "winner", etc.)
   - Clear unsubscribe (for marketing emails)
   - Professional tone

---

## Next Steps

After SMTP is working:

1. ✅ Test verification flow end-to-end
2. ✅ Design beautiful email template
3. ✅ Set up other templates (password reset, etc.)
4. ✅ Add email analytics tracking
5. ✅ Build in-app verification screens

---

**Need help?** 
- Resend Docs: https://resend.com/docs
- SendGrid Docs: https://docs.sendgrid.com
- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-smtp

**Last Updated:** 2025-09-30
