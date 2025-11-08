'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

export default function ViewScriptsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<any>(null)

  useEffect(() => {
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
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
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
            <h2 className="text-2xl font-bold mb-4">Project not found</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
          <p className="text-sm text-gray-600 mt-1">
            {scripts.length} script{scripts.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {scripts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scripts List */}
            <div className="space-y-4">
              {scripts.map((script, index) => {
                // Find the topic for this script
                const topic = project.topics?.find((t: any) => t.id === script.topicId)
                
                return (
                  <div
                    key={script.id || index}
                    onClick={() => setSelectedScript(script)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedScript?.id === script.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Script #{index + 1}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {script.readingTime || 60}s
                      </span>
                    </div>
                    {topic && (
                      <p className="text-sm text-gray-700 mb-2 font-medium">
                        {topic.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 italic line-clamp-2">
                      "{script.hook || topic?.hook}"
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Script Detail View */}
            <div className="lg:sticky lg:top-4">
              {selectedScript ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Script Detail</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedScript.content)
                        alert('Script copied to clipboard!')
                      }}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      📋 Copy
                    </button>
                  </div>

                  {/* Script Content */}
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 leading-relaxed">
                        {selectedScript.content}
                      </pre>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    {selectedScript.deliveryNotes && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Delivery Notes
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
                          {typeof selectedScript.deliveryNotes === 'string' 
                            ? selectedScript.deliveryNotes
                            : JSON.stringify(selectedScript.deliveryNotes, null, 2)
                          }
                        </div>
                      </div>
                    )}

                    {selectedScript.visualCues && Array.isArray(selectedScript.visualCues) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Visual Cues
                        </h3>
                        <ul className="bg-purple-50 rounded-lg p-3 space-y-1">
                          {selectedScript.visualCues.map((cue: string, i: number) => (
                            <li key={i} className="text-sm text-purple-900">
                              • {cue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Reading time: {selectedScript.readingTime || 60} seconds
                      </span>
                      <span className="text-xs text-gray-500">
                        Version {selectedScript.version || 1}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-600">
                    Select a script to view details
                  </p>
                </div>
              )}
            </div>
          </div>
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
