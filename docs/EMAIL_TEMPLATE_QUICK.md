# 🎨 Quick Email Template Customization (Using Supabase Built-in)

## ⚡ No SMTP Setup Needed!

You can customize your email templates RIGHT NOW using Supabase's built-in email service.

---

## Step 1: Go to Email Templates

1. Open: https://supabase.com/dashboard/project/ocmhylirrfijyosxwtph/auth/templates
2. Click "Confirm signup" template

---

## Step 2: Replace the Template

Copy and paste this beautiful template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
  
  <!-- Main Container -->
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Email Card -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="font-size: 60px; margin-bottom: 10px;">🙏</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Heavenly Hub</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 24px; font-weight: 600; text-align: center;">
                Verify Your Email Address
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                Welcome to Heavenly Hub! We're excited to have you on this spiritual journey. 
                Click the button below to verify your email and unlock your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; 
                              padding: 16px 48px; text-decoration: none; border-radius: 8px; 
                              font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      ✨ Verify My Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>

              <!-- Fallback Link -->
              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #4299e1; font-size: 13px; word-break: break-all; text-align: center; margin: 0 0 30px;">
                {{ .ConfirmationURL }}
              </p>

              <!-- Expiry Notice -->
              <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #c53030; font-size: 14px; margin: 0; font-weight: 500;">
                  ⏰ This verification link expires in 24 hours
                </p>
              </div>

              <!-- Help Text -->
              <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                If you didn't create an account with Heavenly Hub, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0 0 10px; line-height: 1.5;">
                Sent with 💜 by Heavenly Hub
              </p>
              <p style="color: #cbd5e0; font-size: 12px; margin: 0; line-height: 1.5;">
                Need help? Reply to this email or contact support@heavenlyhub.com
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## Step 3: Configure Redirect URL

Still on the same page, scroll down to "Redirect URLs"

**Add this:**
```
heavenlyhub://verify
```

This is where users land after clicking the email link.

---

## Step 4: Save and Test!

1. Click "Save"
2. Sign up with a test account in your app
3. Check your email - it should look beautiful! ✨

---

## 🎨 Customization Options

Want to tweak it? Here's what you can change:

### Colors
```css
/* Purple gradient (current) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Blue gradient */
background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);

/* Gold/Divine */
background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);

/* Green/Growth */
background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
```

### Icon
Change the emoji:
```html
<div style="font-size: 60px;">🙏</div>  <!-- Current -->
<div style="font-size: 60px;">✨</div>  <!-- Sparkles -->
<div style="font-size: 60px;">🕊️</div>  <!-- Dove -->
<div style="font-size: 60px;">📖</div>  <!-- Bible -->
<div style="font-size: 60px;">⛪</div>  <!-- Church -->
```

### Text
```html
<p>Welcome to Heavenly Hub!</p>
<!-- Change to -->
<p>Your spiritual journey begins here.</p>
```

---

## 📧 What It Looks Like

### Email Inbox:
```
From: noreply@mail.supabase.io
Subject: Confirm Your Email
Preview: Welcome to Heavenly Hub! Verify your email...
```

### Email Content:
- Purple gradient header with 🙏 icon
- "Heavenly Hub" title
- Clear verification message
- Big purple "Verify My Account" button
- Fallback link below
- Expiry warning box
- Professional footer

---

## ⚙️ Variables You Can Use

Supabase provides these:

- `{{ .ConfirmationURL }}` - The verification link (required!)
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app URL
- `{{ .Token }}` - Raw token (usually don't need this)
- `{{ .TokenHash }}` - Token hash (usually don't need this)

**Example:**
```html
<p>Hi {{ .Email }},</p>
<p>Welcome to our app!</p>
```

---

## 🚀 Other Templates to Customize

While you're there, customize these too:

### 1. Magic Link (Passwordless Login)
Same style, different message:
```html
<h2>Sign In to Heavenly Hub</h2>
<p>Click below to securely sign in to your account:</p>
```

### 2. Reset Password
```html
<h2>Reset Your Password</h2>
<p>Click below to reset your Heavenly Hub password:</p>
```

### 3. Change Email
```html
<h2>Confirm Email Change</h2>
<p>Click below to confirm your new email address:</p>
```

---

## ✅ Limitations (Using Supabase Built-in)

Remember, you're still using Supabase's email service, so:

- ⚠️ Emails come from `noreply@mail.supabase.io`
- ⚠️ ~200 emails/day limit
- ⚠️ Shared IP (lower deliverability)

**But the template looks professional!** ✨

When you're ready for production, you can switch to custom SMTP 
and keep this same template - just with a better "from" address.

---

## 🎯 What's Next?

After email looks good:

1. ✅ Build the in-app verification screens
2. ✅ Handle deep link when user clicks email
3. ✅ Show success animation
4. ✅ Navigate to paywall

See `docs/SMTP_SETUP_GUIDE.md` for the full production setup when ready.

---

**Last Updated:** 2025-09-30

ont yo




