'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ScriptsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const currentProject = projects.find((p: any) => p.id === params.id)
    
    if (currentProject) {
      setProject(currentProject)
    } else {
      router.push('/dashboard')
    }
  }, [params.id, router])

  const handleCreateBatchPlan = async () => {
    setGeneratingPlan(true)

    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      
      const response = await fetch('/api/batch-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scripts: project.scripts,
          profile,
          filmingHours: 8
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate batch plan')
      }

      const data = await response.json()

      // Update project with batch plan
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const projectIndex = projects.findIndex((p: any) => p.id === params.id)
      
      if (projectIndex !== -1) {
        projects[projectIndex].batchPlan = data.batchPlan
        localStorage.setItem('projects', JSON.stringify(projects))
        
        // Navigate to batch plan page
        router.push(`/dashboard/project/${params.id}/batch-plan`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate batch plan. Please try again.')
    } finally {
      setGeneratingPlan(false)
    }
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const scripts = project.scripts || []
  const hasBatchPlan = project.batchPlan

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/dashboard/project/${params.id}`} className="text-gray-600 hover:text-gray-900 inline-block mb-4">
            ← Back to Topics
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{project.name} - Scripts</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          {hasBatchPlan && (
            <Link
              href={`/dashboard/project/${params.id}/batch-plan`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              View Batch Plan
            </Link>
          )}
          
          {scripts.length >= 3 && (
            <button
              onClick={handleCreateBatchPlan}
              disabled={generatingPlan}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {generatingPlan ? 'Creating Batch Plan...' : 'Create Batch Plan'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Scripts ({scripts.length})
          </h2>

          {scripts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No scripts yet</p>
              <Link
                href={`/dashboard/project/${params.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back and generate scripts →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {scripts.map((script: any, index: number) => (
                <Link
                  key={index}
                  href={`/dashboard/project/${params.id}/scripts/${index}`}
                  className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{script.topicTitle}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {script.readingTime}s
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Hook:</strong> {script.hook}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {script.deliveryNotes.pacing}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      Energy: {script.deliveryNotes.energy}/10
                    </span>
                    {script.verificationStatus === 'needs_review' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        ⚠️ Needs Fact-Check
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {scripts.length > 0 && scripts.length < 3 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 Generate at least 3 scripts to create a batch filming plan
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}