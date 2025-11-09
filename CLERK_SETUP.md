# Clerk Authentication Setup Guide

## 🔐 Getting Your Clerk API Keys

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Start Building for Free"
3. Sign up with your email or GitHub account

### Step 2: Create a New Application

1. Once logged in, you'll see the Clerk Dashboard
2. Click "Add Application" or "Create Application"
3. Choose a name for your application (e.g., "Shorts Studio")
4. Select your authentication providers:
   - ✅ Email (recommended)
   - ✅ Google (recommended)
   - ✅ GitHub (optional)
   - You can add more later
5. Click "Create Application"

### Step 3: Get Your API Keys

1. After creating the application, you'll see the "API Keys" section
2. You'll see two types of keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

3. Copy both keys

### Step 4: Add Keys to Your Project

1. Open your `.env.local` file in the project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key-here
CLERK_SECRET_KEY=sk_test_your-actual-secret-here
```

3. **IMPORTANT**: Never commit these keys to GitHub
   - They are already in `.gitignore`
   - Use `.env.example` as a template for teammates

---

## 🎨 Customizing Clerk Appearance

### In the Clerk Dashboard

1. Go to **Customization** → **Appearance**
2. You can customize:
   - Colors and branding
   - Logo
   - Social login buttons
   - Form layouts

### In Your Code

We've already customized the appearance in the sign-in/sign-up pages:

```typescript
<SignIn
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-lg"
    }
  }}
/>
```

You can add more customization in `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`.

---

## 🔧 Configuring Authentication Settings

### In the Clerk Dashboard

Go to **User & Authentication** to configure:

1. **Email Settings**
   - Enable email verification
   - Customize email templates
   - Set up magic links

2. **Social Connections**
   - Add Google OAuth
   - Add GitHub OAuth
   - Configure redirect URLs

3. **Session Settings**
   - Session duration
   - Multi-session handling
   - Session tokens

4. **User Management**
   - Profile fields
   - User metadata
   - Account deletion

---

## 🛡️ Security Best Practices

### 1. Environment Variables

- ✅ Use `.env.local` for local development
- ✅ Add keys to Vercel for production
- ❌ Never commit `.env.local` to Git
- ❌ Never share secret keys publicly

### 2. Redirect URLs

In Clerk Dashboard → **Paths**:

- **After sign in**: `/dashboard`
- **After sign up**: `/onboarding`
- **After sign out**: `/`

### 3. Allowed Redirect URLs

Add these in Clerk Dashboard → **Paths** → **Redirects**:

For development:
```
http://localhost:3000
http://localhost:3000/dashboard
http://localhost:3000/onboarding
```

For production (after deploying):
```
https://your-app.vercel.app
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/onboarding
```

---

## 🚀 Testing Authentication

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000)

3. Click "Get Started Free" → You should see the Clerk sign-up form

4. Create a test account with your email

5. After signing up, you should be redirected to `/onboarding`

6. Try signing out and signing back in

### What to Test

- ✅ Sign up with email
- ✅ Email verification (if enabled)
- ✅ Sign in with existing account
- ✅ Sign out
- ✅ Protected routes redirect to sign-in
- ✅ UserButton shows in navigation when signed in
- ✅ Sign-up redirects to onboarding
- ✅ Sign-in redirects to dashboard

---

## 🐛 Troubleshooting

### Error: "Invalid publishable key"

**Solution**:
1. Double-check your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
2. Make sure it starts with `pk_test_` or `pk_live_`
3. Restart your dev server: `npm run dev`

### Error: "Clerk: Missing publishableKey"

**Solution**:
1. Make sure `.env.local` exists in your project root
2. Check that the environment variable name is exactly: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Restart your development server

### Redirects Not Working

**Solution**:
1. Go to Clerk Dashboard → **Paths**
2. Make sure these are configured:
   - Sign-in fallback redirect: `/dashboard`
   - Sign-up fallback redirect: `/onboarding`
   - After sign out: `/`

### Users Can't Sign In

**Solution**:
1. Check if email verification is required (Dashboard → **Email, phone, username**)
2. Make sure you've verified the test email
3. Check browser console for errors
4. Verify API keys are correct

### Protected Routes Not Working

**Solution**:
1. Check that `middleware.ts` exists in the root directory
2. Make sure ClerkProvider wraps your app in `app/layout.tsx`
3. Verify the middleware matcher is configured correctly

---

## 📊 Monitoring Users

### Clerk Dashboard

Go to **Users** to see:
- Total users
- Active sessions
- Recent sign-ups
- User details and metadata

### Useful Actions

- **Delete user**: Users → Select user → Delete
- **Ban user**: Users → Select user → Ban
- **Reset password**: Users → Select user → Reset password
- **View sessions**: Users → Select user → Sessions

---

## 🔄 Syncing Users to Database (Next Step)

Once you set up Supabase (next task), you'll want to:

1. Create a user in your database when they sign up
2. Use Clerk webhooks to sync user data
3. Store user metadata in your database

We'll cover this in the next phase!

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Customization Options](https://clerk.com/docs/components/customization/overview)
- [User Management](https://clerk.com/docs/users/overview)

---

## ✅ Checklist

Before moving to production:

- [ ] Add real email domain (not using temporary email for testing)
- [ ] Configure production redirect URLs in Clerk Dashboard
- [ ] Set up email templates (Dashboard → **Emails**)
- [ ] Enable 2FA if needed (Dashboard → **Multi-factor**)
- [ ] Configure session settings (Dashboard → **Sessions**)
- [ ] Add Clerk environment variables to Vercel
- [ ] Test sign-up/sign-in flow in production
- [ ] Set up webhooks for user sync (after Supabase setup)

---

**Need Help?**
- Check the [Clerk Discord](https://clerk.com/discord)
- Review the [documentation](https://clerk.com/docs)
- Check your Clerk Dashboard logs for errors
