'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

type SortField = 'createdAt' | 'readingTime' | 'verificationStatus'
type SortOrder = 'asc' | 'desc'
type ProductionMode = 'traditional' | 'ai-voice-stock' | 'fully-ai'

export default function ScriptsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
  const [productionMode, setProductionMode] = useState<ProductionMode>('ai-voice-stock')
  const [searchQuery, setSearchQuery] = useState('')

  // Load production mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('productionMode') as ProductionMode | null
    if (savedMode) {
      setProductionMode(savedMode)
      console.log('📋 Loaded production mode from localStorage:', savedMode)
    }
  }, [])
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

      const selectedTopicIds = localStorage.getItem('selectedTopicIds')
      console.log('🔍 Checking for selectedTopicIds in localStorage:', selectedTopicIds)

      if (selectedTopicIds) {
        const topicIds = JSON.parse(selectedTopicIds)
        console.log('✅ Found selected topic IDs:', topicIds)
        
        localStorage.removeItem('selectedTopicIds')
        console.log('🗑️ Cleared selectedTopicIds from localStorage')
        
        await generateScriptsForTopics(currentProject, topicIds)
      } else {
        console.log('ℹ️ No selectedTopicIds found in localStorage')
      }
    } catch (err) {
      console.error('❌ Error loading project:', err)
      setLoading(false)
    }
  }

  const generateScriptsForTopics = async (proj: any, topicIds: string[]) => {
    console.log('🚀 Starting script generation for', topicIds.length, 'topics')
    console.log('🎬 Production mode:', productionMode)
    setGenerating(true)
    setGenerationProgress({ current: 0, total: topicIds.length })

    try {
      const userProfileStr = localStorage.getItem('userProfile')
      console.log('👤 User profile from localStorage:', userProfileStr ? 'Found' : 'Not found')
      
      if (!userProfileStr) {
        console.log('❌ No user profile found - redirecting to onboarding')
        alert('Please complete onboarding first to generate scripts')
        router.push('/onboarding')
        return
      }

      const userProfile = JSON.parse(userProfileStr)
      console.log('✅ User profile loaded:', userProfile.name)

      const selectedTopics = proj.topics.filter((t: any) => topicIds.includes(t.id))
      console.log('📝 Selected topics to generate scripts for:', selectedTopics.length)

      if (selectedTopics.length === 0) {
        console.log('❌ No matching topics found')
        alert('Selected topics not found in project')
        setGenerating(false)
        return
      }

      const newScripts = []

      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i]
        console.log(`\n🌐 Calling API for topic ${i + 1}/${selectedTopics.length}:`, topic.title)
        console.log('🎬 Using production mode:', productionMode)
        
        setGenerationProgress({ current: i + 1, total: selectedTopics.length })

        try {
          const response = await fetch('/api/scripts/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              topic,
              userProfile,
              productionMode,
            }),
          })

          console.log('📡 API response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API error:', errorText)
            throw new Error(`Failed to generate script: ${response.status}`)
          }

          const data = await response.json()
          console.log('✅ Script generated successfully:', data.script?.hook?.substring(0, 50) + '...')
          console.log('🎬 Production mode:', data.script?.productionMode)
          
          newScripts.push(data.script)
        } catch (error) {
          console.error(`❌ Error generating script for topic ${i + 1}:`, error)
        }
      }

      console.log(`\n✅ Generated ${newScripts.length} scripts total`)

      const updatedProject = {
        ...proj,
        scripts: [...(proj.scripts || []), ...newScripts],
      }

      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const updatedProjects = projects.map((p: any) =>
          p.id === proj.id ? updatedProject : p
        )
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        console.log('💾 Saved updated project to localStorage')
      }

      setProject(updatedProject)
      setScripts(updatedProject.scripts)
      setGenerating(false)
      console.log('🎉 Script generation complete!')

    } catch (error) {
      console.error('❌ Error in generateScriptsForTopics:', error)
      alert('Failed to generate scripts. Please try again.')
      setGenerating(false)
    }
  }

  const filteredAndSortedScripts = scripts
    .filter((script) => {
      const matchesSearch =
        script.topicTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.hook?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter =
        filterStatus === 'all' ||
        script.verificationStatus === filterStatus

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortField === 'readingTime') {
        comparison = (a.readingTime || 0) - (b.readingTime || 0)
      } else if (sortField === 'verificationStatus') {
        comparison = (a.verificationStatus || '').localeCompare(b.verificationStatus || '')
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

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
            <p className="text-gray-600 mb-2">
              Creating script {generationProgress.current} of {generationProgress.total}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Mode: {productionMode === 'ai-voice-stock' ? 'AI Voice + Stock Footage' : productionMode === 'fully-ai' ? 'Fully AI Generated' : 'Traditional Filming'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
              ></div>
            </div>
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
              ← Back to Dashboard
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
              <p className="text-sm text-gray-600 mt-1">{scripts.length} scripts total</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {scripts.length > 0 ? (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="verified">Verified</option>
                </select>

                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="readingTime">Sort by Length</option>
                  <option value="verificationStatus">Sort by Status</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAndSortedScripts.map((script: any, index: number) => (
                <Link
                  key={script.id || index}
                  href={`/dashboard/project/${project.id}/scripts/${index}`}
                  className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {script.topicTitle || `Script #${index + 1}`}
                        </h3>
                        {script.productionMode && (
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            {script.productionMode === 'ai-voice-stock' ? '🎙️ AI Voice + Stock' : script.productionMode === 'fully-ai' ? '🤖 Fully AI' : '🎥 Traditional'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 italic mb-3">
                        "{script.hook || 'No hook'}"
                      </p>
                      {script.content && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {script.content.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {script.readingTime || 60}s
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          script.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {script.verificationStatus === 'verified' ? 'Verified' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scripts yet</h3>
            <p className="text-gray-600 mb-6">Generate scripts from your topics to get started</p>
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
