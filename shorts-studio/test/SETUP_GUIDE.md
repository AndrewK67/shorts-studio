# Shorts Studio - Setup Guide

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Get your API key:**
- Go to https://console.anthropic.com/
- Sign up or log in
- Navigate to API Keys
- Create a new key
- Copy and paste it into `.env.local`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🌐 Deploying to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Setup complete"
git push
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Add Environment Variables

**CRITICAL:** Before deploying, add your API key:

1. In Vercel project settings
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
4. Click **Save**

### Step 4: Deploy

Click **Deploy** and wait for build to complete.

### If You Get 404 Error:

1. Check deployment logs in Vercel dashboard
2. Verify environment variables are set
3. Try redeploying: **Deployments** → Three dots → **Redeploy**

---

## 📁 Project Structure

```
shorts-studio/
├── app/
│   ├── api/                    # API Routes
│   │   ├── topics/
│   │   │   └── generate/
│   │   │       └── route.ts    # Topic generation endpoint
│   │   ├── scripts/
│   │   │   └── generate/
│   │   │       └── route.ts    # Script generation endpoint
│   │   └── batch-plan/
│   │       └── generate/
│   │           └── route.ts    # Batch plan endpoint
│   ├── dashboard/              # Dashboard pages
│   ├── onboarding/             # Onboarding flow
│   ├── profiles/               # Profile management
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                 # Reusable components
│   ├── Navigation.tsx
│   ├── LoadingSpinner.tsx     # NEW
│   └── Alert.tsx              # NEW
├── lib/
│   └── store.ts               # Zustand state management (NEW)
├── .env.local                 # Environment variables (create this)
├── .env.example               # Template for environment variables
└── package.json
```

---

## 🔧 Files to Add

### 1. Copy store.ts to your project

```bash
# Create lib folder
mkdir lib

# Copy the store file (I created this for you)
# Move store.ts to: lib/store.ts
```

### 2. Copy components

```bash
# Create components folder if it doesn't exist
mkdir components

# Copy these files (I created them for you):
# - LoadingSpinner.tsx → components/LoadingSpinner.tsx
# - Alert.tsx → components/Alert.tsx
```

### 3. Update your topics API route

Replace `app/api/topics/generate/route.ts` with the improved version I created (`improved-topics-route.ts`)

---

## 🎯 Using the Store

Update your components to use the Zustand store instead of localStorage:

### Example: Dashboard Page

```typescript
'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { userProfile, projects, isLoading } = useAppStore()

  if (!userProfile) {
    return <div>Please complete onboarding</div>
  }

  return (
    <div>
      <h1>Welcome, {userProfile.name}!</h1>
      <p>Projects: {projects.length}</p>
    </div>
  )
}
```

### Example: Onboarding Page

```typescript
'use client'

import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { addUserProfile } = useAppStore()
  const router = useRouter()

  const handleComplete = () => {
    const newProfile = {
      id: Date.now().toString(),
      name: 'John Doe',
      // ... other fields
      createdAt: new Date().toISOString()
    }
    
    addUserProfile(newProfile)
    router.push('/dashboard')
  }

  // ... rest of component
}
```

---

## 🧪 Testing the API

### Test Topic Generation

```bash
curl -X POST http://localhost:3000/api/topics/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "name": "Test User",
      "channelName": "Test Channel",
      "niche": "Tech tutorials",
      "uniqueAngle": "Beginner-friendly",
      "primaryTone": "Educational",
      "secondaryTone": "Friendly",
      "accentTone": "Humor"
    },
    "projectConfig": {
      "month": "2025-12",
      "videosNeeded": 10
    }
  }'
```

---

## 🐛 Common Issues

### Issue: "ANTHROPIC_API_KEY is not configured"

**Solution:** 
1. Make sure `.env.local` exists in project root
2. Restart your dev server: `npm run dev`
3. For Vercel: Add environment variable in dashboard

### Issue: 404 on Vercel deployment

**Solution:**
1. Check Vercel deployment logs
2. Verify all files are committed to GitHub
3. Try manual redeploy in Vercel dashboard

### Issue: "Failed to generate topics"

**Solution:**
1. Check API key is valid
2. Check Anthropic API status: https://status.anthropic.com/
3. Check browser console for detailed error
4. Verify request payload is correct

---

## 🎨 Next Steps

1. ✅ Set up environment variables
2. ✅ Add Zustand store
3. ✅ Add reusable components
4. ✅ Deploy to Vercel
5. ⏭️ Test topic generation
6. ⏭️ Add regional calendar data
7. ⏭️ Improve UI/UX
8. ⏭️ Add database (Supabase)
9. ⏭️ Add authentication

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

## 💡 Tips

- Use `console.log()` in API routes to debug
- Check browser Network tab for API errors
- Use Vercel deployment logs for production debugging
- Keep your API key secret - never commit `.env.local` to GitHub

---

Need help? Check the issues in your repo or refer to the design document!
