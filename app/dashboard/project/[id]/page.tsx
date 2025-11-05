'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [generatingScripts, setGeneratingScripts] = useState(false)

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const currentProject = projects.find((p: any) => p.id === params.id)
    
    if (currentProject) {
      if (!currentProject.profileName) {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
        currentProject.profileName = profile.profileName || profile.name
        currentProject.niche = profile.niche
        currentProject.primaryTone = profile.primaryTone
        currentProject.location = profile.location
      }
      setProject(currentProject)
    } else {
      router.push('/dashboard')
    }
  }, [params.id, router])

  const handleSelectAll = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([])
    } else {
      setSelectedTopics(topics.map((t: any) => t.id || t.title))
    }
  }

  const handleSelectTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId))
    } else {
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  const handleGenerateScripts = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic')
      return
    }

    setGeneratingScripts(true)

    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      const topicsToGenerate = topics.filter((t: any) => 
        selectedTopics.includes(t.id || t.title)
      )

      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topics: topicsToGenerate,
          profile,
          productionMode: project.productionMode || 'traditional'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate scripts')
      }

      const data = await response.json()

      // Update project with scripts
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const projectIndex = projects.findIndex((p: any) => p.id === params.id)
      
      if (projectIndex !== -1) {
        projects[projectIndex].scripts = [
          ...(projects[projectIndex].scripts || []),
          ...data.scripts
        ]
        localStorage.setItem('projects', JSON.stringify(projects))
        
        // Navigate to scripts page
        router.push(`/dashboard/project/${params.id}/scripts`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate scripts. Please try again.')
    } finally {
      setGeneratingScripts(false)
    }
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const topics = project.topics || []
  const hasScripts = project.scripts && project.scripts.length > 0
  const productionMode = project.productionMode || 'traditional'
  
  const productionModeLabels: Record<string, string> = {
    'traditional': '🎥 Traditional Filming',
    'ai-voice': '🤖 AI Voice + Stock Footage',
    'ai-video': '✨ Fully AI-Generated'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 inline-block mb-4">
            ← Back to Dashboard
          </Link>
          
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(project.month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Profile Context</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Profile</p>
                <p className="text-blue-900">{project.profileName || 'Default Profile'}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Niche</p>
                <p className="text-blue-900">{project.niche}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Primary Tone</p>
                <p className="text-blue-900">{project.primaryTone}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Location</p>
                <p className="text-blue-900">{project.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-purple-900 mb-1">🎬 Production Mode</h3>
            <p className="text-purple-800 font-medium">{productionModeLabels[productionMode]}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          {hasScripts && (
            <Link
              href={`/dashboard/project/${params.id}/scripts`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              View Scripts ({project.scripts.length})
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Topics ({topics.length})
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <button
                onClick={handleGenerateScripts}
                disabled={selectedTopics.length === 0 || generatingScripts}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingScripts 
                  ? `Generating ${selectedTopics.length} Scripts...` 
                  : `Generate ${productionMode === 'ai-video' ? 'AI Video' : productionMode === 'ai-voice' ? 'AI Voice' : ''} Scripts (${selectedTopics.length})`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedTopics.length === topics.length && topics.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hook</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tone</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic: any, index: number) => {
                  const topicId = topic.id || topic.title
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topicId)}
                          onChange={() => handleSelectTopic(topicId)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{topic.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{topic.coreValue}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {topic.hook}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                          {topic.tone}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {topics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No topics yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}