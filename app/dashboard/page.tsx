'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import Navigation from '../../components/Navigation'
import { getCurrentUser } from '@/lib/db/users'
import { getActiveProfile, getUserProfiles } from '@/lib/db/profiles'
import { getUserProjects, getProjectStats } from '@/lib/db/projects'

export default function DashboardPage() {
  const { userId: clerkUserId, isLoaded } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({ totalTopics: 0, totalScripts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!isLoaded) return

      if (!clerkUserId) {
        setLoading(false)
        return
      }

      try {
        // Get user's database record
        const dbUser = await getCurrentUser(clerkUserId)

        if (!dbUser) {
          console.log('User not found in database yet')
          setLoading(false)
          return
        }

        // Load active profile
        const activeProfile = await getActiveProfile()

        if (activeProfile) {
          setProfile(activeProfile)

          // Load projects for this profile
          const userProjects = await getUserProjects(activeProfile.id)
          setProjects(userProjects)

          // Load stats
          const projectStats = await getProjectStats(activeProfile.id)
          setStats(projectStats)
        } else {
          // No profile found - user needs to complete onboarding
          console.log('No profile found')
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [clerkUserId, isLoaded])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Shorts Studio!
          </h2>
          <p className="text-gray-600 mb-6">
            Let's set up your profile to get started creating amazing YouTube Shorts content.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Get Started →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back!</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Active Profile:</p>
              <p className="text-sm font-medium text-gray-900">
                {profile.profile_name || profile.channel_name || profile.niche || 'Your Profile'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Topics</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalTopics}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Scripts</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalScripts}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/new-project"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">+ New Content Plan</h3>
              <p className="text-sm text-gray-600">Generate 30+ topics for next month</p>
            </Link>
            <Link
              href="/profiles"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">⚙️ Manage Profiles</h3>
              <p className="text-sm text-gray-600">Switch or create new content profiles</p>
            </Link>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
            <Link
              href="/dashboard/new-project"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first content plan to get started</p>
              <Link
                href="/dashboard/new-project"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.name || 'Untitled Project'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {project.topics?.length || 0} topics • {project.scripts?.length || 0} scripts
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.status || 'planning'}
                    </span>
                  </div>
                  {project.month && (
                    <p className="text-xs text-gray-500">📅 {project.month}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
