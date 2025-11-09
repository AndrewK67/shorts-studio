'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { getCurrentUser, createUser } from '@/lib/db/users'
import { getActiveProfile } from '@/lib/db/profiles'
import { createProject } from '@/lib/db/projects'
import { createTopics } from '@/lib/db/topics'

export default function NewProjectPage() {
  const router = useRouter()
  const { userId: clerkUserId, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [projectConfig, setProjectConfig] = useState({
    month: new Date().toISOString().slice(0, 7),
    postsPerDay: 1,
    bufferVideos: 3,
    productionMode: 'traditional',
    toneMix: {
      emotional: 30,
      calming: 25,
      storytelling: 20,
      educational: 15,
      humor: 10
    }
  })

  useEffect(() => {
    async function loadProfile() {
      if (!isLoaded) return

      if (!clerkUserId) {
        router.push('/sign-in')
        return
      }

      try {
        let dbUser = await getCurrentUser(clerkUserId)
        if (!dbUser) {
          // Create user record as fallback (until Clerk webhook is set up)
          console.log('📝 Creating user record in database...')
          const email = clerkUser?.primaryEmailAddress?.emailAddress || ''
          const name = clerkUser?.fullName || clerkUser?.firstName || null

          if (!email) {
            console.error('Unable to get email address')
            router.push('/onboarding')
            return
          }

          try {
            dbUser = await createUser(clerkUserId, email, name)
            console.log('✅ User record created:', dbUser.id)
          } catch (error) {
            console.error('❌ Failed to create user record:', error)
            alert('Failed to create user account. Please try again.')
            router.push('/onboarding')
            return
          }
        }

        const activeProfile = await getActiveProfile()
        if (!activeProfile) {
          console.error('No active profile found')
          router.push('/onboarding')
          return
        }

        setUserProfile(activeProfile)
      } catch (error) {
        console.error('Error loading profile:', error)
        alert('Failed to load your profile. Please try again.')
      } finally {
        setPageLoading(false)
      }
    }

    loadProfile()
  }, [clerkUserId, isLoaded, router])

  const handleGenerateTopics = async () => {
    if (!clerkUserId || !userProfile) {
      alert('Please complete your profile first')
      router.push('/onboarding')
      return
    }

    setLoading(true)

    try {
      // Get database user
      let dbUser = await getCurrentUser(clerkUserId)
      if (!dbUser) {
        // This shouldn't happen since we check in loadProfile, but just in case
        console.error('User not found in database')
        alert('User account not found. Please complete onboarding.')
        router.push('/onboarding')
        return
      }

      // Calculate videos needed
      const daysInMonth = new Date(
        parseInt(projectConfig.month.split('-')[0]),
        parseInt(projectConfig.month.split('-')[1]),
        0
      ).getDate()

      const totalVideosNeeded = (daysInMonth * projectConfig.postsPerDay) + projectConfig.bufferVideos

      // Create project in database first
      const projectName = `${new Date(projectConfig.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Plan`

      console.log('Creating project in database...')
      const newProject = await createProject(dbUser.id, userProfile.id, {
        name: projectName,
        month: projectConfig.month,
        videos_needed: totalVideosNeeded,
        tone_mix: projectConfig.toneMix,
        status: 'planning'
      })

      console.log('✅ Project created:', newProject.id)

      // Prepare profile data for API (convert database format to API format)
      const profileForAPI = {
        name: userProfile.profile_name,
        channelName: userProfile.channel_name,
        niche: userProfile.niche,
        uniqueAngle: userProfile.unique_angle,
        primaryTone: userProfile.primary_tone,
        secondaryTone: userProfile.secondary_tone,
        accentTone: userProfile.accent_tone,
      }

      // Generate topics via API
      console.log('Generating topics via API...')
      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: profileForAPI,
          regional: {}, // TODO: Load from database when implemented
          projectConfig: {
            ...projectConfig,
            videosNeeded: totalVideosNeeded
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate topics')
      }

      const data = await response.json()
      console.log(`✅ Generated ${data.topics.length} topics`)

      // Save topics to database
      const topicsToSave = data.topics.map((topic: any) => ({
        title: topic.title,
        hook: topic.hook,
        core_value: topic.coreValue,
        emotional_driver: topic.emotionalDriver,
        format_type: topic.formatType,
        tone: topic.tone,
        longevity: topic.longevity,
        date_range_start: topic.dateRangeStart,
        date_range_end: topic.dateRangeEnd,
        fact_check_status: topic.factCheckStatus || 'needs_review',
        order_index: topic.orderIndex,
      }))

      console.log('Saving topics to database...')
      await createTopics(newProject.id, topicsToSave)
      console.log('✅ Topics saved to database')

      // Redirect to project detail page
      router.push(`/dashboard/project/${newProject.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate topics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = new Date(
    parseInt(projectConfig.month.split('-')[0]),
    parseInt(projectConfig.month.split('-')[1]),
    0
  ).getDate()

  const totalVideosNeeded = (daysInMonth * projectConfig.postsPerDay) + projectConfig.bufferVideos

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile found. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create New Content Plan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="space-y-8">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={projectConfig.month}
                onChange={(e) => setProjectConfig({ ...projectConfig, month: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Posts Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posts Per Day
              </label>
              <div className="flex gap-4">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setProjectConfig({ ...projectConfig, postsPerDay: num })}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      projectConfig.postsPerDay === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} per day
                  </button>
                ))}
              </div>
            </div>

            {/* Buffer Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Videos (extras for flexibility)
              </label>
              <input
                type="number"
                value={projectConfig.bufferVideos}
                onChange={(e) => setProjectConfig({ ...projectConfig, bufferVideos: parseInt(e.target.value) })}
                min="0"
                max="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Production Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Mode
              </label>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'traditional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="traditional"
                    checked={projectConfig.productionMode === 'traditional'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🎥 Traditional Filming</p>
                    <p className="text-sm text-gray-600">Film yourself on camera - standard YouTube Shorts</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'ai-voice' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="ai-voice"
                    checked={projectConfig.productionMode === 'ai-voice'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🤖 AI Voice + Stock Footage</p>
                    <p className="text-sm text-gray-600">AI voiceover with stock/custom visuals - semi-faceless</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'ai-video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="ai-video"
                    checked={projectConfig.productionMode === 'ai-video'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">✨ Fully AI-Generated</p>
                    <p className="text-sm text-gray-600">AI voice + AI-generated visuals - completely faceless</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tone Mix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tone Mix (adjust percentages)
              </label>
              <div className="space-y-4">
                {Object.entries(projectConfig.toneMix).map(([tone, value]) => (
                  <div key={tone}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{tone}</span>
                      <span className="text-sm text-gray-600">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) =>
                        setProjectConfig({
                          ...projectConfig,
                          toneMix: {
                            ...projectConfig.toneMix,
                            [tone]: parseInt(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Plan Summary</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• {daysInMonth} days in {new Date(projectConfig.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                <li>• {projectConfig.postsPerDay} post(s) per day = {daysInMonth * projectConfig.postsPerDay} videos</li>
                <li>• {projectConfig.bufferVideos} buffer videos</li>
                <li>• <strong>Total: {totalVideosNeeded} topics to generate</strong></li>
                <li>• Production: {
                  projectConfig.productionMode === 'traditional' ? '🎥 Traditional Filming' :
                  projectConfig.productionMode === 'ai-voice' ? '🤖 AI Voice + Stock' :
                  '✨ Fully AI-Generated'
                }</li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateTopics}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Generating Topics...' : `Generate ${totalVideosNeeded} Topics`}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}