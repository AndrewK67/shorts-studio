'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'
import { getProjectById } from '@/lib/db/projects'
import { getScriptsByProjectId, createScripts } from '@/lib/db/scripts'
import { getTopicById } from '@/lib/db/topics'
import { getCurrentUser, createUser } from '@/lib/db/users'
import { getActiveProfile } from '@/lib/db/profiles'
import { useAuth, useUser } from '@clerk/nextjs'

type SortField = 'createdAt' | 'readingTime' | 'title'
type SortOrder = 'asc' | 'desc'

export default function ScriptsListPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId: clerkUserId } = useAuth()
  const { user: clerkUser } = useUser()
  const [project, setProject] = useState<any>(null)
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs_review' | 'verified'>('all')

  useEffect(() => {
    loadProjectAndScripts()
  }, [params.id, searchParams])

  const loadProjectAndScripts = async () => {
    try {
      const projectId = params.id as string

      // Load project from database
      const projectData = await getProjectById(projectId)
      if (!projectData) {
        console.error('Project not found')
        setLoading(false)
        return
      }

      setProject(projectData)

      // Check if we need to generate scripts for selected topics
      const topicsParam = searchParams.get('topics')
      if (topicsParam && !generating) {
        await handleGenerateScripts(projectId, topicsParam)
      }

      // Load scripts from database
      const scriptsData = await getScriptsByProjectId(projectId)
      setScripts(scriptsData)

      console.log(`✅ Loaded ${scriptsData.length} scripts`)
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setLoading(false)
    }
  }

  const handleGenerateScripts = async (projectId: string, topicsParam: string) => {
    try {
      setGenerating(true)

      // Get user profile for script generation
      if (!clerkUserId) {
        alert('Please sign in to generate scripts')
        return
      }

      let dbUser = await getCurrentUser(clerkUserId)
      if (!dbUser) {
        // Create user record as fallback (until Clerk webhook is set up)
        console.log('📝 Creating user record in database...')
        const email = clerkUser?.primaryEmailAddress?.emailAddress || ''
        const name = clerkUser?.fullName || clerkUser?.firstName || null

        if (!email) {
          alert('Unable to get your email address. Please sign in again.')
          return
        }

        try {
          dbUser = await createUser(clerkUserId, email, name)
          console.log('✅ User record created:', dbUser.id)
        } catch (error) {
          console.error('❌ Failed to create user record:', error)
          alert('Failed to create user account. Please try again.')
          return
        }
      }

      const profile = await getActiveProfile()
      if (!profile) {
        alert('No active profile found. Please complete onboarding first.')
        router.push('/onboarding')
        return
      }

      const topicIds = topicsParam.split(',')
      setGenerationProgress({ current: 0, total: topicIds.length })

      const generatedScripts = []

      for (let i = 0; i < topicIds.length; i++) {
        const topicId = topicIds[i]
        setGenerationProgress({ current: i + 1, total: topicIds.length })

        // Load topic from database
        const topic = await getTopicById(topicId)
        if (!topic) {
          console.error(`Topic ${topicId} not found`)
          continue
        }

        console.log(`Generating script ${i + 1}/${topicIds.length} for: ${topic.title}`)

        // Convert profile for API
        const profileForAPI = {
          name: profile.profile_name,
          channelName: profile.channel_name,
          niche: profile.niche,
          primaryTone: profile.primary_tone,
          secondaryTone: profile.secondary_tone,
        }

        // Convert topic for API (camelCase format)
        const topicForAPI = {
          id: topic.id,
          title: topic.title,
          hook: topic.hook,
          coreValue: topic.core_value,
          tone: topic.tone,
          formatType: topic.format_type,
        }

        // Call script generation API
        const response = await fetch('/api/scripts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: profileForAPI,
            topic: topicForAPI,
          }),
        })

        if (!response.ok) {
          console.error(`Failed to generate script for topic ${topic.title}`)
          continue
        }

        const data = await response.json()
        if (data.script) {
          generatedScripts.push({
            topic_id: topicId,
            content: data.script.content,
            hook: data.script.hook,
            reading_time: data.script.readingTime,
            delivery_notes: data.script.deliveryNotes,
            visual_cues: data.script.visualCues,
            verification_status: 'pending',
          })
        }
      }

      // Save all generated scripts to database
      if (generatedScripts.length > 0) {
        console.log(`Saving ${generatedScripts.length} scripts to database...`)
        await createScripts(projectId, generatedScripts)
        console.log('✅ Scripts saved to database')

        // Reload scripts from database
        const updatedScripts = await getScriptsByProjectId(projectId)
        setScripts(updatedScripts)
      }

      // Clear the topics query param from URL
      router.replace(`/dashboard/project/${projectId}/scripts`)

    } catch (error) {
      console.error('Error generating scripts:', error)
      alert('Failed to generate scripts. Please try again.')
    } finally {
      setGenerating(false)
      setGenerationProgress({ current: 0, total: 0 })
    }
  }

  const handleDelete = async (scriptId: string) => {
    if (!confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
      return
    }

    try {
      const { deleteScript } = await import('@/lib/db/scripts')
      await deleteScript(scriptId)

      // Reload scripts from database
      const updatedScripts = await getScriptsByProjectId(params.id as string)
      setScripts(updatedScripts)

      alert('Script deleted successfully')
    } catch (err) {
      console.error('Error deleting script:', err)
      alert('Failed to delete script')
    }
  }

  const handleExport = (script: any) => {
    const exportText = `
SCRIPT: ${script.hook || 'Untitled'}
Reading Time: ${script.reading_time || 'N/A'} seconds
Created: ${script.created_at ? new Date(script.created_at).toLocaleDateString() : 'N/A'}

HOOK:
${script.hook || 'N/A'}

FULL SCRIPT:
${script.content || 'No content available'}

DELIVERY NOTES:
${typeof script.delivery_notes === 'object'
  ? JSON.stringify(script.delivery_notes, null, 2)
  : script.delivery_notes || 'N/A'
}

VISUAL CUES:
${Array.isArray(script.visual_cues)
  ? script.visual_cues.join('\n')
  : typeof script.visual_cues === 'object'
    ? JSON.stringify(script.visual_cues, null, 2)
    : script.visual_cues || 'N/A'
}
`.trim()

    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `script-${script.id || Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filter and sort scripts
  const filteredAndSortedScripts = scripts
    .map((script, index) => ({ ...script, originalIndex: index }))
    .filter(script => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          (script.hook || '').toLowerCase().includes(query) ||
          (script.content || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Filter by verification status
      if (filterStatus !== 'all') {
        const status = script.verification_status || 'needs_review'
        if (status !== filterStatus) return false
      }

      return true
    })
    .sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.created_at || 0).getTime()
          bVal = new Date(b.created_at || 0).getTime()
          break
        case 'readingTime':
          aVal = a.reading_time || 0
          bVal = b.reading_time || 0
          break
        case 'title':
          aVal = (a.hook || '').toLowerCase()
          bVal = (b.hook || '').toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const getScriptTitle = (script: any, index: number) => {
    if (script.hook) return script.hook.substring(0, 50) + (script.hook.length > 50 ? '...' : '')
    return `Script #${index + 1}`
  }

  const getScriptTone = (script: any) => {
    if (script.delivery_notes?.tone) return script.delivery_notes.tone
    return 'N/A'
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {generating
                ? `Generating scripts... (${generationProgress.current}/${generationProgress.total})`
                : 'Loading scripts...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/dashboard/project/${project.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Project
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
              <p className="text-sm text-gray-600 mt-1">
                {scripts.length} script{scripts.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {scripts.length > 0 ? (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search scripts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="readingTime">Reading Time</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                {/* Filter Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fact-Check Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Scripts</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>

              {/* Sort Order Toggle */}
              <div className="mt-3">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
            </div>

            {/* Scripts Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hook Preview
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reading Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedScripts.length > 0 ? (
                      filteredAndSortedScripts.map((script) => (
                        <tr key={script.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getScriptTitle(script, script.originalIndex)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate italic">
                              "{script.hook ? script.hook.substring(0, 50) : 'No hook'}..."
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {script.reading_time || 60}s
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {getScriptTone(script)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded ${
                              script.verification_status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {script.verification_status === 'verified' ? 'Verified' : 'Needs Review'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/project/${params.id}/scripts/${script.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                              <Link
                                href={`/dashboard/project/${params.id}/scripts/${script.id}?edit=true`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleExport(script)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Export
                              </button>
                              <button
                                onClick={() => handleDelete(script.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-500">No scripts match your filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredAndSortedScripts.length} of {scripts.length} scripts
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No scripts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate scripts from your topics to get started
            </p>
            <Link
              href={`/dashboard/project/${project.id}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Back to Project
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
