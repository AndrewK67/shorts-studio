'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../components/Navigation'

export default function TopicsListPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTone, setFilterTone] = useState<string>('all')
  const [filterLongevity, setFilterLongevity] = useState<string>('all')

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      const projects = JSON.parse(savedProjects)
      const currentProject = projects.find((p: any) => p.id === params.id)
      if (currentProject) {
        setProject(currentProject)
        setTopics(currentProject.topics || [])
      }
    }
    setLoading(false)
  }, [params.id])

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    const toneMatch = filterTone === 'all' || topic.tone === filterTone
    const longevityMatch = filterLongevity === 'all' || topic.longevity === filterLongevity
    return toneMatch && longevityMatch
  })

  // Get unique tones and longevities for filters
  const uniqueTones = Array.from(new Set(topics.map(t => t.tone)))
  const uniqueLongevities = Array.from(new Set(topics.map(t => t.longevity)))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Topics</h1>
          <p className="text-gray-600">
            {filteredTopics.length} of {topics.length} topics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {topics.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Tone
                </label>
                <select
                  value={filterTone}
                  onChange={(e) => setFilterTone(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Tones</option>
                  {uniqueTones.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Type
                </label>
                <select
                  value={filterLongevity}
                  onChange={(e) => setFilterLongevity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  {uniqueLongevities.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Topics List */}
        {filteredTopics.length > 0 ? (
          <div className="space-y-4">
            {filteredTopics.map((topic, index) => (
              <div
                key={topic.id || index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-500">
                        #{topic.orderIndex || index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {topic.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-3 italic">
                      "{topic.hook}"
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {topic.coreValue}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    {topic.tone}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                    {topic.longevity}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                    {topic.formatType}
                  </span>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">
                    {topic.emotionalDriver}
                  </span>
                  {topic.factCheckStatus === 'needs_review' && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">
                      ⚠️ Needs Review
                    </span>
                  )}
                </div>

                {/* Date Range */}
                {topic.dateRangeStart && topic.dateRangeEnd && (
                  <p className="text-xs text-gray-500">
                    📅 Best for: {topic.dateRangeStart} to {topic.dateRangeEnd}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No topics found
            </h3>
            <p className="text-gray-600">
              {topics.length === 0 
                ? "This project doesn't have any topics yet."
                : "No topics match your filters. Try adjusting them."}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {topics.length > 0 && (
          <div className="mt-8 flex gap-4">
            <Link
              href={`/dashboard/project/${project.id}/scripts`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate Scripts from Topics →
            </Link>
            <button
              onClick={() => {
                const topicsText = filteredTopics
                  .map((t, i) => `${i + 1}. ${t.title}\n   Hook: "${t.hook}"\n`)
                  .join('\n')
                navigator.clipboard.writeText(topicsText)
                alert('Topics copied to clipboard!')
              }}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
            >
              Copy Topics to Clipboard
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
