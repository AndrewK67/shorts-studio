'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../components/Navigation'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Get projects from localStorage
      const savedProjects = localStorage.getItem('projects')
      
      if (!savedProjects) {
        setError('No projects found')
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
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project')
      setLoading(false)
    }
  }, [params.id])

  // Loading state
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

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Project not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              This project may have been deleted or doesn't exist.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state - show project
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {project.topics?.length || 0} topics • {project.scripts?.length || 0} scripts
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {project.status || 'planning'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/dashboard/project/${project.id}/topics`}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              📝 View Topics
            </h3>
            <p className="text-sm text-gray-600">
              {project.topics?.length || 0} topics generated
            </p>
          </Link>

          <Link
            href={`/dashboard/project/${project.id}/scripts`}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              ✍️ Scripts
            </h3>
            <p className="text-sm text-gray-600">
              {project.scripts?.length || 0} scripts written
            </p>
          </Link>

          <Link
            href={`/dashboard/project/${project.id}/batch-plan`}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              🎬 Batch Plan
            </h3>
            <p className="text-sm text-gray-600">
              Plan your filming session
            </p>
          </Link>
        </div>

        {/* Topics Preview */}
        {project.topics && project.topics.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Topics</h2>
              <Link
                href={`/dashboard/project/${project.id}/scripts`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Generate Scripts →
              </Link>
            </div>
            <div className="space-y-3">
              {project.topics.slice(0, 5).map((topic: any, index: number) => (
                <div
                  key={topic.id || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {topic.hook}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {topic.tone}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          {topic.longevity}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {topic.formatType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {project.topics.length > 5 && (
                <Link
                  href={`/dashboard/project/${project.id}/topics`}
                  className="block text-center py-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {project.topics.length} topics →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* No topics yet */}
        {(!project.topics || project.topics.length === 0) && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No topics yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate topics to get started with your content plan
            </p>
            <button
              onClick={() => router.push('/dashboard/new-project')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate Topics
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
