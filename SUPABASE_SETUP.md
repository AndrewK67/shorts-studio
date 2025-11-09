# Supabase Database Setup Guide

## 🗄️ Complete Database Setup for Shorts Studio

This guide walks you through setting up Supabase as your database, running migrations, and connecting it to Clerk for automatic user synchronization.

---

## Step 1: Create a Supabase Project

### 1.1 Sign Up for Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### 1.2 Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `shorts-studio` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait 2-3 minutes for project to be provisioned

---

## Step 2: Get Your API Keys

### 2.1 Navigate to API Settings

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **API**

### 2.2 Copy Your Keys

You'll see three important pieces of information:

1. **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
2. **anon/public key**: Long string starting with `eyJ...`
3. **service_role key**: Long string starting with `eyJ...` (keep this secret!)

### 2.3 Add to Your .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Run Database Migrations

### 3.1 Open SQL Editor

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"

### 3.2 Run Initial Schema Migration

1. Open `supabase/migrations/20250101000000_initial_schema.sql` in your project
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" or press `Cmd/Ctrl + Enter`
5. You should see "Success. No rows returned"

This creates all your tables:
- ✅ users
- ✅ user_profiles
- ✅ regional_configs
- ✅ custom_events
- ✅ projects
- ✅ topics
- ✅ scripts
- ✅ batch_plans
- ✅ series
- ✅ series_episodes

### 3.3 Run Row Level Security Migration

1. Click "New query" again
2. Open `supabase/migrations/20250101000001_row_level_security.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

This enables RLS and creates security policies to ensure users can only access their own data.

### 3.4 Verify Tables Were Created

1. Go to **Table Editor** (left sidebar)
2. You should see all 10 tables listed
3. Click on `users` table to verify structure

---

## Step 4: Set Up Clerk Webhook for User Sync

This ensures that when users sign up via Clerk, they're automatically created in your Supabase database.

### 4.1 Deploy Your App (Required for Webhooks)

**Option A: Deploy to Vercel**

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (all your keys from .env.local)
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your deployment URL (e.g., `https://shorts-studio.vercel.app`)

**Option B: Use ngrok for Local Testing**

```bash
# Install ngrok
npm install -g ngrok

# Run your dev server in one terminal
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 4.2 Create Webhook in Clerk Dashboard

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** (left sidebar)
4. Click "Add Endpoint"
5. Fill in the form:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk` or `https://abc123.ngrok.io/api/webhooks/clerk`
   - **Subscribe to events**:
     - ✅ user.created
     - ✅ user.updated
     - ✅ user.deleted
6. Click "Create"

### 4.3 Get Webhook Signing Secret

1. After creating the webhook, you'll see it in the list
2. Click on the webhook endpoint
3. Scroll down to find **Signing Secret**
4. Click "Reveal" and copy the secret (starts with `whsec_`)

### 4.4 Add Webhook Secret to Environment

**In .env.local**:
```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

**In Vercel** (if deployed):
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `CLERK_WEBHOOK_SECRET` with your value
4. Redeploy your project

### 4.5 Test the Webhook

1. Go back to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Scroll down to "Testing"
4. Click "Send Example" for `user.created`
5. You should see a 200 response
6. Check your Supabase database:
   - Go to **Table Editor** → `users`
   - You should see a test user created

---

## Step 5: Verify Everything Works

### 5.1 Test User Creation Flow

1. Go to your app (deployed or local)
2. Click "Get Started Free"
3. Create a new account
4. After signing up, check Supabase:
   - Go to **Table Editor** → `users`
   - Your new user should appear!

### 5.2 Check Logs

**In Vercel** (if deployed):
1. Go to your project
2. Click on "Functions" tab
3. Look for `/api/webhooks/clerk`
4. You should see successful requests

**Locally**:
Check your terminal running `npm run dev` for console logs:
```
✅ User created in Supabase: uuid-here
```

---

## Step 6: Enable Realtime (Optional)

If you want realtime updates when data changes:

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the tables you want to replicate
3. Toggle them on (start with `projects` and `topics`)
4. Click "Save"

---

## 🔐 Security Best Practices

### 1. Protect Your Keys

- ✅ **Never commit** `.env.local` to Git (already in `.gitignore`)
- ✅ **Use different keys** for development and production
- ✅ **Rotate keys** if they're ever exposed
- ✅ **Use environment variables** in Vercel for production

### 2. Row Level Security (RLS)

Our migrations already enabled RLS, which means:
- ✅ Users can only see their own data
- ✅ API calls are automatically filtered by user
- ✅ No accidental data leaks

### 3. Webhook Security

- ✅ Webhook secret verifies requests are from Clerk
- ✅ Svix library validates signatures
- ✅ Invalid requests are rejected

---

## 🐛 Troubleshooting

### Error: "relation 'users' does not exist"

**Solution**: You haven't run the migrations yet. Go back to Step 3.

### Error: "permission denied for table users"

**Solution**: RLS is enabled but policies aren't set. Run the RLS migration (Step 3.3).

### Webhook Returns 500 Error

**Solutions**:
1. Check your `CLERK_WEBHOOK_SECRET` is correct
2. Verify your Supabase keys are valid
3. Check Vercel function logs for detailed error
4. Make sure you ran both migrations

### User Not Created in Supabase

**Solutions**:
1. Check webhook is configured correctly in Clerk
2. Verify webhook URL is correct and accessible
3. Check that `user.created` event is subscribed
4. Look for errors in Vercel/local logs

### "Error: Missing auth header"

**Solution**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.

---

## 📊 Database Schema Overview

### Core Tables

1. **users** - Stores Clerk user accounts
2. **user_profiles** - Content creator profiles with voice and boundaries
3. **regional_configs** - Location-based content customization
4. **custom_events** - User-defined events for content planning

### Content Planning

5. **projects** - Monthly content planning projects
6. **topics** - AI-generated video topic ideas
7. **scripts** - Written scripts with delivery notes
8. **batch_plans** - Production planning for efficient filming

### Series Management

9. **series** - Recurring content series
10. **series_episodes** - Individual episodes within series

### Relationships

```
users
  └─ user_profiles
       ├─ regional_configs
       ├─ custom_events
       └─ projects
            ├─ topics
            │    └─ scripts
            └─ batch_plans

users
  └─ series
       └─ series_episodes
            ├─ topics (optional link)
            └─ scripts (optional link)
```

---

## 🔄 Database Maintenance

### Backing Up Your Database

1. Go to **Database** → **Backups**
2. Click "Create backup"
3. Backups are automatic on paid plans

### Monitoring Usage

1. Go to **Settings** → **Usage**
2. Monitor:
   - Database size
   - API requests
   - Storage usage

### Upgrading Your Plan

Free tier limits:
- 500 MB database size
- 2 GB bandwidth
- 50,000 monthly active users

Upgrade when you need more at **Settings** → **Billing**.

---

## 🚀 Next Steps

After completing this setup:

1. ✅ Database is ready
2. ✅ Users auto-sync from Clerk
3. ✅ RLS protects user data
4. ✅ Ready to build features

**Next tasks**:
- [ ] Update onboarding to save profiles to database
- [ ] Migrate project creation to use Supabase
- [ ] Replace localStorage with database calls
- [ ] Build database-backed topic generator

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Webhooks Docs](https://clerk.com/docs/integrations/webhooks)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## ✅ Setup Checklist

Before moving on, ensure you've completed:

- [ ] Created Supabase project
- [ ] Added Supabase keys to `.env.local`
- [ ] Ran initial schema migration
- [ ] Ran RLS migration
- [ ] Verified tables exist in Table Editor
- [ ] Created Clerk webhook endpoint
- [ ] Added webhook secret to environment
- [ ] Tested webhook by creating a user
- [ ] Verified user appears in Supabase database

**All done?** You're ready to build database-backed features! 🎉
