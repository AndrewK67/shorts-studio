'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

export default function ScriptsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [selectedTopics, setSelectedTopics] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Load project
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      const projects = JSON.parse(savedProjects)
      const currentProject = projects.find((p: any) => p.id === params.id)
      if (currentProject) {
        setProject(currentProject)
        
        // Load selected topic IDs
        const selectedIds = JSON.parse(localStorage.getItem('selectedTopicIds') || '[]')
        
        if (selectedIds.length === 0) {
          setError('No topics selected. Please go back and select topics first.')
          return
        }
        
        // Filter to only selected topics
        const topics = currentProject.topics?.filter((t: any) => 
          selectedIds.includes(t.id)
        ) || []
        
        setSelectedTopics(topics)
      }
    }
  }, [params.id])

  const handleGenerateScripts = async () => {
    if (!project || selectedTopics.length === 0) return

    setGenerating(true)
    setError(null)
    setProgress(0)

    try {
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      
      // Generate scripts for each selected topic
      const generatedScripts = []
      
      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i]
        setProgress(Math.round(((i + 1) / selectedTopics.length) * 100))
        
        console.log(`Generating script ${i + 1}/${selectedTopics.length} for: ${topic.title}`)
        
        try {
          const response = await fetch('/api/scripts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userProfile,
              topic,
              projectConfig: {
                month: project.month,
              }
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Script generation error:', errorData)
            throw new Error(`Failed to generate script: ${errorData.details || 'Unknown error'}`)
          }

          const data = await response.json()
          console.log('Script generated:', data.script)
          
          if (data.success && data.script) {
            generatedScripts.push(data.script)
          }
        } catch (err) {
          console.error(`Error generating script ${i + 1}:`, err)
          // Continue with next script even if one fails
        }
      }

      console.log(`Generated ${generatedScripts.length} scripts total`)

      if (generatedScripts.length === 0) {
        throw new Error('Failed to generate any scripts. Check console for details.')
      }

      // Save scripts to project
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === params.id)
        
        console.log('Found project at index:', projectIndex)
        
        if (projectIndex !== -1) {
          // Initialize scripts array if it doesn't exist
          if (!projects[projectIndex].scripts) {
            projects[projectIndex].scripts = []
          }
          
          // Add new scripts
          projects[projectIndex].scripts = [
            ...projects[projectIndex].scripts,
            ...generatedScripts
          ]
          
          console.log('Saving', projects[projectIndex].scripts.length, 'scripts to project')
          localStorage.setItem('projects', JSON.stringify(projects))
          console.log('✅ Scripts saved successfully')
        } else {
          console.error('❌ Project not found in localStorage')
          throw new Error('Project not found')
        }
      } else {
        console.error('❌ No projects found in localStorage')
        throw new Error('No projects found')
      }

      // Clear selected topics
      localStorage.removeItem('selectedTopicIds')

      // Show success and redirect
      alert(`✅ Successfully generated ${generatedScripts.length} script${generatedScripts.length !== 1 ? 's' : ''}!`)
      
      // Force reload the page to show updated data
      window.location.href = `/dashboard/project/${project.id}`

    } catch (err) {
      console.error('Error generating scripts:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate scripts')
    } finally {
      setGenerating(false)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !generating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/dashboard/project/${project.id}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Project
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
          <h1 className="text-3xl font-bold text-gray-900">Generate Scripts</h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedTopics.length} topics selected
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!generating ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ready to Generate Scripts
            </h2>
            <p className="text-gray-600 mb-6">
              You've selected {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''}. 
              Click the button below to generate scripts for each topic.
            </p>

            {/* Selected Topics Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Topics:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedTopics.map((topic, index) => (
                  <div key={topic.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {topic.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateScripts}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Generate {selectedTopics.length} Script{selectedTopics.length !== 1 ? 's' : ''}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✍️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Generating Scripts...
              </h2>
              <p className="text-gray-600 mb-6">
                Please wait while we create your scripts. This may take a minute.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {progress}% complete
              </p>

              {error && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
