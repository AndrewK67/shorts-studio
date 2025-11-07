'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../components/Navigation'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())

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
    if (selectedTopics.size === 0) {
      alert('Please select at least one topic to generate scripts')
      return
    }

    // Save selected topic IDs to localStorage for the scripts page
    localStorage.setItem('selectedTopicIds', JSON.stringify(Array.from(selectedTopics)))
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Actions Bar */}
        {topicsCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-blue-900">
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
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
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
                    {/* Checkbox */}
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
