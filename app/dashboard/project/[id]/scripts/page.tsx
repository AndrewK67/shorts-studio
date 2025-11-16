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
  
  // Load production mode from localStorage IMMEDIATELY
  const [productionMode, setProductionMode] = useState<ProductionMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('productionMode') as ProductionMode | null
      console.log('🎬 Initializing production mode from localStorage:', savedMode || 'not found, using default')
      return savedMode || 'ai-voice-stock'
    }
    return 'ai-voice-stock'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs_review' | 'verified'>('all')
  
  // Script selection for batch planning
  const [selectedScripts, setSelectedScripts] = useState<Set<number>>(new Set())

  useEffect(() => {
    const savedMode = localStorage.getItem('productionMode') as ProductionMode | null
    if (savedMode && savedMode !== productionMode) {
      setProductionMode(savedMode)
      console.log('📋 Updated production mode from localStorage:', savedMode)
    }
  }, [])

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

      // 🔧 FIX: Changed from selectedTopicIds to selectedTopicIndices
      const selectedTopicIndices = localStorage.getItem('selectedTopicIndices')
      console.log('🔍 Checking for selectedTopicIndices in localStorage:', selectedTopicIndices)

      if (selectedTopicIndices) {
        const topicIndices = JSON.parse(selectedTopicIndices)
        console.log('✅ Found selected topic indices:', topicIndices)
        
        // Load production mode RIGHT BEFORE using it
        const currentProductionMode = localStorage.getItem('productionMode') as ProductionMode || productionMode
        console.log('🎬 Production mode for generation:', currentProductionMode)
        
        localStorage.removeItem('selectedTopicIndices')
        console.log('🗑️ Cleared selectedTopicIndices from localStorage')
        
        await generateScriptsForTopics(currentProject, topicIndices, currentProductionMode)
      } else {
        console.log('ℹ️ No selectedTopicIndices found in localStorage')
      }
    } catch (err) {
      console.error('❌ Error loading project:', err)
      setLoading(false)
    }
  }

  // 🔧 FIX: Changed parameter from topicIds to topicIndices, type from string[] to number[]
  const generateScriptsForTopics = async (proj: any, topicIndices: number[], mode: ProductionMode) => {
    console.log('🚀 Starting script generation for', topicIndices.length, 'topic indices:', topicIndices)
    console.log('🎬 Production mode (parameter):', mode)
    setGenerating(true)
    setGenerationProgress({ current: 0, total: topicIndices.length })

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

      // 🔧 FIX: Select topics by index instead of filtering by ID
      const selectedTopics = topicIndices
        .map(index => proj.topics[index])
        .filter(topic => topic !== undefined)
      
      console.log('📝 Selected topics to generate scripts for:', selectedTopics.length)
      console.log('📋 Topic titles:', selectedTopics.map((t: any) => t.title))

      if (selectedTopics.length === 0) {
        console.log('❌ No matching topics found for indices:', topicIndices)
        alert('Selected topics not found in project. Please try selecting topics again.')
        setGenerating(false)
        return
      }

      const newScripts = []

      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i]
        console.log(`\n🌐 Calling API for topic ${i + 1}/${selectedTopics.length}:`, topic.title)
        console.log('🎬 Using production mode:', mode)
        
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
              productionMode: mode,
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

  const toggleScript = (scriptIndex: number) => {
    const newSelected = new Set(selectedScripts)
    if (newSelected.has(scriptIndex)) {
      newSelected.delete(scriptIndex)
    } else {
      newSelected.add(scriptIndex)
    }
    setSelectedScripts(newSelected)
  }

  const selectAllScripts = () => {
    const allIndices = new Set<number>(scripts.map((_, idx) => idx))
    setSelectedScripts(allIndices)
  }

  const clearSelection = () => {
    setSelectedScripts(new Set())
  }

  const handleCreateBatchPlan = () => {
    if (selectedScripts.size === 0) {
      alert('Please select at least one script to create a batch plan')
      return
    }

    const scriptIndicesArray = Array.from(selectedScripts)
    localStorage.setItem('selectedScriptIndices', JSON.stringify(scriptIndicesArray))
    router.push(`/dashboard/project/${params.id}/batch-plan`)
  }

  // Filtering and sorting
  const filteredAndSortedScripts = scripts
    .filter(script => {
      const matchesSearch = !searchQuery || 
        script.topicTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.hook?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || script.verificationStatus === filterStatus
      
      return matchesSearch && matchesStatus
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
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scripts...</p>
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
            <p className="text-xl text-gray-600 mb-4">Project not found</p>
            <Link
              href="/dashboard"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/project/${params.id}`}
            className="text-purple-600 hover:text-purple-700 mb-4 inline-flex items-center gap-1"
          >
            ← Back to Project
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
              <p className="text-gray-600 mt-1">{project.name} • {scripts.length} script{scripts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {generating && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">
                  Generating Scripts... ({generationProgress.current}/{generationProgress.total})
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter, Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Scripts
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or hook..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Scripts</option>
                <option value="needs_review">Needs Review</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortField(field as SortField)
                  setSortOrder(order as SortOrder)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="readingTime-asc">Shortest First</option>
                <option value="readingTime-desc">Longest First</option>
                <option value="verificationStatus-asc">Status A-Z</option>
                <option value="verificationStatus-desc">Status Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Plan Selection Controls */}
        {scripts.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Batch Production Planning
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedScripts.size === 0
                    ? 'Select scripts to create a batch filming plan'
                    : `${selectedScripts.size} script${selectedScripts.size !== 1 ? 's' : ''} selected for batch plan`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAllScripts}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Select All
                </button>
                {selectedScripts.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleCreateBatchPlan}
                  disabled={selectedScripts.size === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedScripts.size > 0
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  📋 Create Batch Plan ({selectedScripts.size})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scripts List */}
        {filteredAndSortedScripts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {scripts.length === 0
                ? 'No scripts yet. Generate scripts from your topics to get started.'
                : 'No scripts match your current filters.'}
            </p>
            {scripts.length === 0 && (
              <Link
                href={`/dashboard/project/${params.id}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Go to Topics →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedScripts.map((script, displayIndex) => {
              // Find the script's original index in the unsorted array
              const originalIndex = scripts.findIndex(s => s.id === script.id || 
                (s.topicTitle === script.topicTitle && s.hook === script.hook))
              
              return (
                <div
                  key={script.id || displayIndex}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 p-6">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedScripts.has(originalIndex >= 0 ? originalIndex : displayIndex)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleScript(originalIndex >= 0 ? originalIndex : displayIndex)
                      }}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    
                    {/* Script Link */}
                    <Link
                      href={`/dashboard/project/${params.id}/scripts/${originalIndex >= 0 ? originalIndex : displayIndex}`}
                      className="flex-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {script.topicTitle || 'Untitled Script'}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {script.hook}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {script.readingTime}s
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              script.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {script.verificationStatus === 'verified' ? '✓ Verified' : '⚠ Needs Review'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {script.productionMode === 'traditional' && '🎬 Traditional'}
                              {script.productionMode === 'ai-voice-stock' && '🎙️ AI Voice + Stock'}
                              {script.productionMode === 'fully-ai' && '🤖 Fully AI'}
                            </span>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
