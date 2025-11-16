'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

interface Script {
  topicTitle: string
  hook: string
  body: string
  cta: string
  readingTime: number
  deliveryNotes?: {
    pacing?: string
    energy?: number
  }
  visualCues?: {
    framing?: string
    lighting?: string
  }
}

interface UserProfile {
  name: string
  niche: string
  primaryTone: string
  location: string
  country: string
}

interface Cluster {
  id: number
  name: string
  description: string
  videoIds: number[]
  videoCount: number
  estimatedTime: string
  outfit: string
  location: string
  props: string[]
  lighting: string
  energy: string
  notes: string
}

interface TimelineItem {
  time: string
  activity: string
  type: 'setup' | 'filming' | 'break'
  clusterId?: number
}

interface BatchPlan {
  summary: {
    totalVideos: number
    totalClusters: number
    estimatedTime: string
    breakCount: number
  }
  clusters: Cluster[]
  timeline: TimelineItem[]
  checklist: {
    preFilming: string[]
    perCluster: string[]
    postFilming: string[]
  }
}

export default function BatchPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [project, setProject] = useState<any>(null)
  const [selectedScripts, setSelectedScripts] = useState<Script[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [batchPlan, setBatchPlan] = useState<BatchPlan | null>(null)

  useEffect(() => {
    loadProjectAndScripts()
  }, [params.id])

  const loadProjectAndScripts = async () => {
    console.log('📦 Loading project and selected scripts for batch plan')
    
    try {
      // 1. Load project
      const savedProjects = localStorage.getItem('projects')
      if (!savedProjects) {
        setError('No projects found. Please create a project first.')
        setLoading(false)
        return
      }

      const projects = JSON.parse(savedProjects)
      const currentProject = projects.find((p: any) => p.id === params.id)
      
      if (!currentProject) {
        setError('Project not found')
        setLoading(false)
        return
      }

      setProject(currentProject)

      // 2. Load selected script indices
      const selectedIndicesStr = localStorage.getItem('selectedScriptIndices')
      console.log('🔍 Checking for selectedScriptIndices in localStorage:', selectedIndicesStr)
      
      if (!selectedIndicesStr) {
        setError('No scripts selected. Please select scripts from the scripts page.')
        setLoading(false)
        return
      }

      const selectedIndices = JSON.parse(selectedIndicesStr)
      console.log('✅ Found selected script indices:', selectedIndices)

      // 3. Get the actual scripts
      const scripts = currentProject.scripts || []
      const selected = selectedIndices
        .map((index: number) => scripts[index])
        .filter((script: any) => script !== undefined)

      console.log(`✅ Loaded scripts for batch plan: ${selected.length}`)
      
      if (selected.length === 0) {
        setError('Selected scripts not found in project')
        setLoading(false)
        return
      }

      setSelectedScripts(selected)

      // 4. Load user profile
      const savedProfile = localStorage.getItem('userProfile')
      console.log('👤 User profile from localStorage:', savedProfile ? 'Found' : 'Not found')
      
      if (!savedProfile) {
        alert('User profile not found. Please complete onboarding first.')
        router.push('/onboarding')
        return
      }

      const userProfile = JSON.parse(savedProfile)
      console.log(`👤 User profile loaded: ${userProfile.name}`)
      setProfile(userProfile)

      setLoading(false)

    } catch (err) {
      console.error('❌ Error loading project and scripts:', err)
      setError('Failed to load project data')
      setLoading(false)
    }
  }

  const generateBatchPlan = async () => {
    if (!profile || selectedScripts.length === 0) {
      alert('Missing profile or scripts')
      return
    }

    console.log('🤖 Generating batch plan clusters with AI...')
    console.log('📊 Request data:', {
      scriptCount: selectedScripts.length,
      profileName: profile.name,
      profileNiche: profile.niche
    })
    
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/batch-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scripts: selectedScripts,
          profile: {
            name: profile.name || 'Creator',
            niche: profile.niche || 'Content Creation',
            primaryTone: profile.primaryTone || 'conversational',
            location: profile.location || 'Unknown',
            country: profile.country || 'United States'
          },
          filmingHours: 8
        }),
      })

      console.log('📡 API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API error details:', errorData)
        throw new Error(`Failed to generate batch plan: ${response.status} - ${errorData.error}`)
      }

      const data = await response.json()
      console.log('✅ Batch plan generated successfully')
      
      setBatchPlan(data.batchPlan)
      setGenerating(false)

    } catch (err) {
      console.error('❌ Error generating batch plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate batch plan')
      setGenerating(false)
    }
  }

  const saveBatchPlan = () => {
    if (!batchPlan || !project) return

    try {
      // Add batch plan to project
      const updatedProject = {
        ...project,
        batchPlans: [...(project.batchPlans || []), {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          plan: batchPlan,
          scriptCount: selectedScripts.length
        }]
      }

      // Save to localStorage
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const updatedProjects = projects.map((p: any) =>
          p.id === project.id ? updatedProject : p
        )
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        alert('✅ Batch plan saved to project!')
      }
    } catch (err) {
      console.error('❌ Error saving batch plan:', err)
      alert('Failed to save batch plan')
    }
  }

  const exportBatchPlan = () => {
    if (!batchPlan) return

    const exportData = {
      project: project.name,
      createdAt: new Date().toISOString(),
      scripts: selectedScripts.map(s => s.topicTitle),
      ...batchPlan
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-plan-${project.name}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading batch plan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
            <Link
              href={`/dashboard/project/${params.id}/scripts`}
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              ← Go to Scripts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/project/${params.id}/scripts`}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 inline-block"
          >
            ← Back to Scripts
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Batch Filming Plan</h1>
          <p className="text-lg text-gray-600">
            {project?.name} • {selectedScripts.length} script{selectedScripts.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Selected Scripts Summary */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Scripts</h2>
          <div className="space-y-2">
            {selectedScripts.map((script, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-700">
                <span className="text-purple-600 font-semibold">#{index + 1}</span>
                <span>{script.topicTitle}</span>
                <span className="text-sm text-gray-500">({script.readingTime}s)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!batchPlan && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Create Your Batch Plan?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              AI will analyze your {selectedScripts.length} scripts and create an optimized filming schedule
              with clusters based on tone, energy, and visual requirements.
            </p>
            <button
              onClick={generateBatchPlan}
              disabled={generating}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                generating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              {generating ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Plan...
                </span>
              ) : (
                '🤖 Generate Batch Plan with AI'
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Generating Plan</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Batch Plan Display */}
        {batchPlan && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Filming Plan Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Total Videos</p>
                  <p className="text-4xl font-bold">{batchPlan.summary.totalVideos}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Clusters</p>
                  <p className="text-4xl font-bold">{batchPlan.summary.totalClusters}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Estimated Time</p>
                  <p className="text-2xl font-bold">{batchPlan.summary.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Breaks</p>
                  <p className="text-4xl font-bold">{batchPlan.summary.breakCount}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={saveBatchPlan}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                💾 Save to Project
              </button>
              <button
                onClick={exportBatchPlan}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                📥 Export JSON
              </button>
            </div>

            {/* Clusters */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Filming Clusters</h2>
              <div className="space-y-6">
                {batchPlan.clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Cluster {cluster.id}: {cluster.name}
                        </h3>
                        <p className="text-gray-600">{cluster.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Videos</p>
                        <p className="text-2xl font-bold text-purple-600">{cluster.videoCount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">⏱️ Estimated Time</p>
                        <p className="text-gray-900">{cluster.estimatedTime}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">⚡ Energy Level</p>
                        <p className="text-gray-900">{cluster.energy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">👔 Outfit</p>
                        <p className="text-gray-900">{cluster.outfit}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">📍 Location</p>
                        <p className="text-gray-900">{cluster.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">💡 Lighting</p>
                        <p className="text-gray-900">{cluster.lighting}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">🎬 Video IDs</p>
                        <p className="text-gray-900">{cluster.videoIds.join(', ')}</p>
                      </div>
                    </div>

                    {cluster.props.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">🎭 Props Needed</p>
                        <div className="flex flex-wrap gap-2">
                          {cluster.props.map((prop, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {prop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cluster.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-900 mb-1">📝 Notes</p>
                        <p className="text-yellow-800">{cluster.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Filming Timeline</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-3">
                  {batchPlan.timeline.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        item.type === 'setup'
                          ? 'bg-blue-50 border border-blue-200'
                          : item.type === 'break'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-purple-50 border border-purple-200'
                      }`}
                    >
                      <span className="font-mono font-semibold text-gray-700 min-w-[100px]">
                        {item.time}
                      </span>
                      <span className="flex-1 text-gray-900">{item.activity}</span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-white">
                        {item.type === 'setup' && '🔧 Setup'}
                        {item.type === 'break' && '☕ Break'}
                        {item.type === 'filming' && '🎬 Filming'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Filming Checklist</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Pre-Filming</h3>
                  <ul className="space-y-2">
                    {batchPlan.checklist.preFilming.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎬 Per Cluster</h3>
                  <ul className="space-y-2">
                    {batchPlan.checklist.perCluster.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Post-Filming</h3>
                  <ul className="space-y-2">
                    {batchPlan.checklist.postFilming.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
