'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

type SortField = 'createdAt' | 'readingTime' | 'title'
type SortOrder = 'asc' | 'desc'

export default function ScriptsListPage() {
  const params = useParams()
  const router = useRouter()
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
    loadProjectAndGenerateIfNeeded()
  }, [params.id])

  const loadProjectAndGenerateIfNeeded = async () => {
    console.log('🔍 Scripts page: loadProjectAndGenerateIfNeeded called')
    try {
      const savedProjects = localStorage.getItem('projects')
      console.log('📦 Loaded projects from localStorage:', savedProjects ? 'Found' : 'Not found')

      if (!savedProjects) {
        setLoading(false)
        return
      }

      const projects = JSON.parse(savedProjects)
      const currentProject = projects.find((p: any) => p.id === params.id)
      console.log('🎯 Current project:', currentProject ? currentProject.name : 'Not found')

      if (!currentProject) {
        setLoading(false)
        return
      }

      setProject(currentProject)
      setScripts(currentProject.scripts || [])
      setLoading(false)

      // Check if we need to generate scripts
      const selectedTopicIdsStr = localStorage.getItem('selectedTopicIds')
      console.log('🔍 Checking for selectedTopicIds in localStorage:', selectedTopicIdsStr)

      if (selectedTopicIdsStr) {
        const selectedTopicIds = JSON.parse(selectedTopicIdsStr)
        console.log('✅ Found selected topic IDs:', selectedTopicIds)

        if (selectedTopicIds.length > 0) {
          console.log(`🚀 Starting script generation for ${selectedTopicIds.length} topics`)

          // Clear the flag immediately to prevent re-triggering
          localStorage.removeItem('selectedTopicIds')
          console.log('🗑️ Cleared selectedTopicIds from localStorage')

          // Generate scripts
          await generateScriptsForTopics(currentProject, selectedTopicIds)
        } else {
          console.log('⚠️ selectedTopicIds array is empty')
        }
      } else {
        console.log('ℹ️ No selectedTopicIds found - not generating scripts')
      }
    } catch (err) {
      console.error('❌ Error in loadProjectAndGenerateIfNeeded:', err)
      setLoading(false)
    }
  }

  const generateScriptsForTopics = async (proj: any, topicIds: string[]) => {
    console.log('🎬 generateScriptsForTopics started')
    console.log('📋 Project:', proj.name)
    console.log('🎯 Topic IDs to generate:', topicIds)

    setGenerating(true)
    setGenerationProgress({ current: 0, total: topicIds.length })

    try {
      // Load user profile
      const userProfileStr = localStorage.getItem('userProfile')
      console.log('👤 User profile from localStorage:', userProfileStr ? 'Found' : 'NOT FOUND')

      if (!userProfileStr) {
        console.error('❌ No user profile found - redirecting to onboarding')
        alert('Please complete onboarding first to generate scripts')
        router.push('/onboarding')
        return
      }

      const userProfile = JSON.parse(userProfileStr)
      console.log('✅ User profile loaded:', userProfile.name)

      // Find the selected topics
      const selectedTopics = proj.topics.filter((t: any) => topicIds.includes(t.id))
      console.log(`🔍 Found ${selectedTopics.length} topics from ${topicIds.length} IDs`)

      if (selectedTopics.length === 0) {
        console.error('❌ No matching topics found')
        alert('Selected topics not found in project')
        setGenerating(false)
        return
      }

      const newScripts: any[] = []

      // Generate script for each topic
      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i]
        setGenerationProgress({ current: i + 1, total: selectedTopics.length })

        console.log(`\n📝 Generating script ${i + 1}/${selectedTopics.length} for topic: "${topic.title}"`)

        try {
          console.log('🌐 Calling API /api/scripts/generate...')
          const response = await fetch('/api/scripts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userProfile,
              topic,
              projectConfig: proj.config || {}
            })
          })

          console.log('📡 API response status:', response.status)
          const data = await response.json()
          console.log('📦 API response data:', data)

          if (data.success && data.script) {
            // Add topic title to script
            const scriptWithTopicTitle = {
              ...data.script,
              topicTitle: topic.title,
              topicId: topic.id
            }
            newScripts.push(scriptWithTopicTitle)
            console.log(`✅ Successfully generated script for: "${topic.title}"`)
          } else {
            console.error(`❌ Failed to generate script for "${topic.title}":`, data.error)
            alert(`Failed to generate script for "${topic.title}": ${data.error || 'Unknown error'}`)
          }
        } catch (error) {
          console.error(`❌ Error generating script for "${topic.title}":`, error)
          alert(`Error generating script for "${topic.title}"`)
        }
      }

      // Save all new scripts to project
      if (newScripts.length > 0) {
        console.log(`💾 Saving ${newScripts.length} new scripts to project...`)
        const savedProjects = localStorage.getItem('projects')
        if (savedProjects) {
          const projects = JSON.parse(savedProjects)
          const projectIndex = projects.findIndex((p: any) => p.id === params.id)

          if (projectIndex !== -1) {
            projects[projectIndex].scripts = [
              ...(projects[projectIndex].scripts || []),
              ...newScripts
            ]
            localStorage.setItem('projects', JSON.stringify(projects))

            // Update local state
            setProject(projects[projectIndex])
            setScripts(projects[projectIndex].scripts || [])

            console.log(`✅ Successfully saved ${newScripts.length} new scripts to project`)
          }
        }
      } else {
        console.log('⚠️ No scripts were generated')
      }

      setGenerating(false)

      if (newScripts.length > 0) {
        alert(`Successfully generated ${newScripts.length} script${newScripts.length !== 1 ? 's' : ''}!`)
      }

    } catch (error) {
      console.error('❌ Error in generateScriptsForTopics:', error)
      alert('Failed to generate scripts. Please try again.')
      setGenerating(false)
    }
  }

  const loadProject = () => {
    try {
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const currentProject = projects.find((p: any) => p.id === params.id)
        if (currentProject) {
          setProject(currentProject)
          setScripts(currentProject.scripts || [])
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setLoading(false)
    }
  }

  const handleDelete = (scriptId: string, scriptIndex: number) => {
    if (!confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
      return
    }

    try {
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === params.id)

        if (projectIndex !== -1) {
          projects[projectIndex].scripts = projects[projectIndex].scripts.filter(
            (_: any, idx: number) => idx !== scriptIndex
          )
          localStorage.setItem('projects', JSON.stringify(projects))
          loadProject() // Reload to update UI
          alert('Script deleted successfully')
        }
      }
    } catch (err) {
      console.error('Error deleting script:', err)
      alert('Failed to delete script')
    }
  }

  const handleExport = (script: any) => {
    const exportText = `
SCRIPT: ${script.topicTitle || 'Untitled'}
Reading Time: ${script.readingTime || 'N/A'} seconds
Created: ${script.createdAt ? new Date(script.createdAt).toLocaleDateString() : 'N/A'}

HOOK:
${script.hook || 'N/A'}

FULL SCRIPT:
${script.content || script.fullScript || 'No content available'}

DELIVERY NOTES:
${typeof script.deliveryNotes === 'object'
  ? JSON.stringify(script.deliveryNotes, null, 2)
  : script.deliveryNotes || 'N/A'
}

VISUAL CUES:
${Array.isArray(script.visualCues)
  ? script.visualCues.join('\n')
  : typeof script.visualCues === 'object'
    ? JSON.stringify(script.visualCues, null, 2)
    : script.visualCues || 'N/A'
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
          (script.content || '').toLowerCase().includes(query) ||
          (script.topicTitle || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Filter by verification status
      if (filterStatus !== 'all') {
        const status = script.verificationStatus || 'needs_review'
        if (status !== filterStatus) return false
      }

      return true
    })
    .sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.createdAt || 0).getTime()
          bVal = new Date(b.createdAt || 0).getTime()
          break
        case 'readingTime':
          aVal = a.readingTime || 0
          bVal = b.readingTime || 0
          break
        case 'title':
          aVal = (a.topicTitle || a.hook || '').toLowerCase()
          bVal = (b.topicTitle || b.hook || '').toLowerCase()
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
    if (script.topicTitle) return script.topicTitle
    if (script.hook) return script.hook.substring(0, 50) + (script.hook.length > 50 ? '...' : '')
    return `Script #${index + 1}`
  }

  const getScriptTone = (script: any) => {
    if (script.tone) return script.tone
    if (script.deliveryNotes?.tone) return script.deliveryNotes.tone
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scripts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Scripts...</h2>
            <p className="text-gray-600 mb-4">
              Creating script {generationProgress.current} of {generationProgress.total}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This may take a minute or two...</p>
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
                        <tr key={script.id || script.originalIndex} className="hover:bg-gray-50">
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
                              {script.readingTime || 60}s
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {getScriptTone(script)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded ${
                              script.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {script.verificationStatus === 'verified' ? 'Verified' : 'Needs Review'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/project/${params.id}/scripts/${script.originalIndex}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                              <Link
                                href={`/dashboard/project/${params.id}/scripts/${script.originalIndex}?edit=true`}
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
                                onClick={() => handleDelete(script.id, script.originalIndex)}
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
