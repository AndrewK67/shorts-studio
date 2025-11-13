'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../components/Navigation'

type ProductionMode = 'traditional' | 'ai-voice-stock' | 'fully-ai'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [productionMode, setProductionMode] = useState<ProductionMode>('ai-voice-stock')

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const currentProject = projects.find((p: any) => p.id === params.id)
        if (currentProject) {
          setProject(currentProject)
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setLoading(false)
    }
  }, [params.id])

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId)
    } else {
      newSelected.add(topicId)
    }
    setSelectedTopics(newSelected)
  }

  const selectAll = () => {
    if (project?.topics) {
      const allIds = new Set<string>(project.topics.map((t: any) => t.id as string))
      setSelectedTopics(allIds)
    }
  }

  const clearSelection = () => {
    setSelectedTopics(new Set())
  }

  const handleGenerateScripts = () => {
    console.log('🎬 Generate Scripts button clicked!')
    console.log('📊 Selected topics count:', selectedTopics.size)
    console.log('🎬 Production mode:', productionMode)

    if (selectedTopics.size === 0) {
      console.log('❌ No topics selected - showing alert')
      alert('Please select at least one topic to generate scripts')
      return
    }

    const topicIdsArray = Array.from(selectedTopics)
    console.log('✅ Topic IDs being saved:', topicIdsArray)

    // Save both topic IDs and production mode
    localStorage.setItem('selectedTopicIds', JSON.stringify(topicIdsArray))
    localStorage.setItem('productionMode', productionMode)
    console.log('💾 Saved to localStorage - topicIds and production mode')

    const verification = localStorage.getItem('selectedTopicIds')
    console.log('✔️ Verification - localStorage contains:', verification)

    console.log(`🚀 Navigating to /dashboard/project/${project.id}/scripts`)
    router.push(`/dashboard/project/${project.id}/scripts`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
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

  const topicsCount = project.topics?.length || 0
  const scriptsCount = project.scripts?.length || 0
  const selectedCount = selectedTopics.size

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{project.name || 'Untitled Project'}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {topicsCount} topics • {scriptsCount} scripts
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {scriptsCount > 0 && (
                  <>
                    <Link
                      href={`/dashboard/project/${project.id}/scripts`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                    >
                      View All Scripts
                    </Link>
                    <Link
                      href={`/dashboard/project/${project.id}/batch-plan`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                    >
                      📋 Batch Production Plan
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scripts Section */}
        {scriptsCount > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Scripts</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {scriptsCount} script{scriptsCount !== 1 ? 's' : ''} generated
                </p>
              </div>
              <Link
                href={`/dashboard/project/${project.id}/scripts`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Scripts
              </Link>
            </div>

            {/* Recent Scripts Preview */}
            <div className="space-y-3">
              {project.scripts.slice(0, 3).map((script: any, index: number) => (
                <Link
                  key={script.id || index}
                  href={`/dashboard/project/${project.id}/scripts/${index}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {script.topicTitle || `Script #${index + 1}`}
                        </h3>
                        {script.productionMode && (
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            {script.productionMode === 'ai-voice-stock' ? '🎙️ AI+Stock' : script.productionMode === 'fully-ai' ? '🤖 AI' : '🎥 Film'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 italic truncate">
                        "{script.hook || 'No hook'}"
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {script.readingTime || 60}s
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        script.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {script.verificationStatus === 'verified' ? 'Verified' : 'Review'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {scriptsCount > 3 && (
                <div className="text-center pt-2">
                  <Link
                    href={`/dashboard/project/${project.id}/scripts`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View {scriptsCount - 3} more script{scriptsCount - 3 !== 1 ? 's' : ''} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Production Mode Selector & Selection Actions Bar */}
        {topicsCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Scripts</h3>
            
            {/* Production Mode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setProductionMode('ai-voice-stock')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    productionMode === 'ai-voice-stock'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎙️</span>
                    <span className="font-semibold text-gray-900">AI Voice + Stock</span>
                  </div>
                  <p className="text-xs text-gray-600">AI narration with stock footage keywords</p>
                </button>

                <button
                  onClick={() => setProductionMode('fully-ai')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    productionMode === 'fully-ai'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <span className="font-semibold text-gray-900">Fully AI Generated</span>
                  </div>
                  <p className="text-xs text-gray-600">AI voice + AI image generation prompts</p>
                </button>

                <button
                  onClick={() => setProductionMode('traditional')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    productionMode === 'traditional'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎥</span>
                    <span className="font-semibold text-gray-900">Traditional Filming</span>
                  </div>
                  <p className="text-xs text-gray-600">On-camera with delivery cues</p>
                </button>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedCount === 0
                    ? 'Select topics to generate scripts'
                    : `${selectedCount} topic${selectedCount !== 1 ? 's' : ''} selected`
                  }
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  {selectedCount > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateScripts}
                disabled={selectedCount === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedCount > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate {selectedCount > 0 ? selectedCount : ''} Script{selectedCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Topics List with Checkboxes */}
        {topicsCount > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your {topicsCount} Topics
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {project.topics.map((topic: any, index: number) => (
                <div
                  key={topic.id || index}
                  onClick={() => toggleTopic(topic.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTopics.has(topic.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <span className="text-sm font-bold text-gray-500 mt-1 flex-shrink-0">
                      #{index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 italic">
                        "{topic.hook}"
                      </p>
                      {topic.coreValue && (
                        <p className="text-xs text-gray-500 mb-2">
                          {topic.coreValue}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {topic.tone && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic.tone}
                          </span>
                        )}
                        {topic.longevity && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {topic.longevity}
                          </span>
                        )}
                        {topic.formatType && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {topic.formatType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const allTopics = project.topics
                    .map((t: any, i: number) =>
                      `${i + 1}. ${t.title}\n   Hook: "${t.hook}"\n`
                    )
                    .join('\n')
                  navigator.clipboard.writeText(allTopics)
                  alert(`All ${topicsCount} topics copied!`)
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                📋 Copy All to Clipboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
            <p className="text-gray-600 mb-6">Generate topics to get started</p>
            <Link
              href="/dashboard/new-project"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate Topics
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
