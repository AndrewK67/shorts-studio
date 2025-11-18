// IMPORTANT: This file MUST be a Server Component (do not add 'use client' at the top)
// This code runs on the server *before* the page is sent to the user.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// --- 1. IMPORT YOUR DASHBOARD COMPONENTS ---
// Import any components your dashboard needs (e.g., your project list, headers, etc.)
// import ProjectList from '@/components/ProjectList' 
// import Header from '@/components/Header'

export default async function DashboardPage() {
  
  // --- 2. ADD THIS AUTHENTICATION BLOCK ---
  // This is the new code. It checks if a user is logged in.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no user is logged in, redirect them to your new login page
  if (!user) {
    redirect('/login')
  }

  // --- 3. ADD YOUR ORIGINAL DATA-FETCHING LOGIC HERE ---
  // This is where your code to fetch projects, profiles, etc. from Supabase
  // (or localStorage, before we migrate it) should go.
  //
  // EXAMPLE for when we move to Supabase:
  // const { data: projects } = await supabase
  //   .from('projects')
  //   .select('*')
  //   .eq('profile_id', user.id) // RLS also handles this, but it's good practice


  // --- 4. RETURN YOUR ORIGINAL DASHBOARD JSX HERE ---
  // This is the JSX (the HTML-like part) that you already have for your dashboard.
  // Just paste it here.
  return (
    <div>
      {/* <Header /> */}
      <main className="p-8">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-gray-600">You are logged in as: {user.email}</p>
        
        {/* This is where you would render your actual dashboard UI.
          For example:
          <ProjectList projects={projects} />
        */}
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Your dashboard content goes here.</p>
        </div>
      </main>
    </div>
  )
}