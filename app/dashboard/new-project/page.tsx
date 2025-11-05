'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projectConfig, setProjectConfig] = useState({
    month: new Date().toISOString().slice(0, 7),
    postsPerDay: 1,
    bufferVideos: 3,
    productionMode: 'traditional',
    toneMix: {
      emotional: 30,
      calming: 25,
      storytelling: 20,
      educational: 15,
      humor: 10
    }
  })

  const handleGenerateTopics = async () => {
    setLoading(true)

    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      const regional = JSON.parse(localStorage.getItem('regionalConfig') || '{}')

      const daysInMonth = new Date(
        parseInt(projectConfig.month.split('-')[0]),
        parseInt(projectConfig.month.split('-')[1]),
        0
      ).getDate()

      const totalVideosNeeded = (daysInMonth * projectConfig.postsPerDay) + projectConfig.bufferVideos

      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: profile,
          regional: regional,
          projectConfig: {
            ...projectConfig,
            videosNeeded: totalVideosNeeded
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate topics')
      }

      const data = await response.json()

      const project = {
        id: Date.now().toString(),
        name: `${new Date(projectConfig.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Plan`,
        month: projectConfig.month,
        videosNeeded: totalVideosNeeded,
        toneMix: projectConfig.toneMix,
        productionMode: projectConfig.productionMode,
        status: 'planning',
        topics: data.topics,
        scripts: [],
        profileName: profile.profileName || profile.name,
        niche: profile.niche,
        primaryTone: profile.primaryTone,
        location: profile.location,
        createdAt: new Date().toISOString()
      }

      const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      existingProjects.push(project)
      localStorage.setItem('projects', JSON.stringify(existingProjects))

      router.push(`/dashboard/project/${project.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate topics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = new Date(
    parseInt(projectConfig.month.split('-')[0]),
    parseInt(projectConfig.month.split('-')[1]),
    0
  ).getDate()

  const totalVideosNeeded = (daysInMonth * projectConfig.postsPerDay) + projectConfig.bufferVideos

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create New Content Plan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="space-y-8">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={projectConfig.month}
                onChange={(e) => setProjectConfig({ ...projectConfig, month: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Posts Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posts Per Day
              </label>
              <div className="flex gap-4">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setProjectConfig({ ...projectConfig, postsPerDay: num })}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      projectConfig.postsPerDay === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} per day
                  </button>
                ))}
              </div>
            </div>

            {/* Buffer Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Videos (extras for flexibility)
              </label>
              <input
                type="number"
                value={projectConfig.bufferVideos}
                onChange={(e) => setProjectConfig({ ...projectConfig, bufferVideos: parseInt(e.target.value) })}
                min="0"
                max="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Production Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Mode
              </label>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'traditional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="traditional"
                    checked={projectConfig.productionMode === 'traditional'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🎥 Traditional Filming</p>
                    <p className="text-sm text-gray-600">Film yourself on camera - standard YouTube Shorts</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'ai-voice' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="ai-voice"
                    checked={projectConfig.productionMode === 'ai-voice'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🤖 AI Voice + Stock Footage</p>
                    <p className="text-sm text-gray-600">AI voiceover with stock/custom visuals - semi-faceless</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  projectConfig.productionMode === 'ai-video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="productionMode"
                    value="ai-video"
                    checked={projectConfig.productionMode === 'ai-video'}
                    onChange={(e) => setProjectConfig({ ...projectConfig, productionMode: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">✨ Fully AI-Generated</p>
                    <p className="text-sm text-gray-600">AI voice + AI-generated visuals - completely faceless</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tone Mix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tone Mix (adjust percentages)
              </label>
              <div className="space-y-4">
                {Object.entries(projectConfig.toneMix).map(([tone, value]) => (
                  <div key={tone}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{tone}</span>
                      <span className="text-sm text-gray-600">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) =>
                        setProjectConfig({
                          ...projectConfig,
                          toneMix: {
                            ...projectConfig.toneMix,
                            [tone]: parseInt(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Plan Summary</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• {daysInMonth} days in {new Date(projectConfig.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                <li>• {projectConfig.postsPerDay} post(s) per day = {daysInMonth * projectConfig.postsPerDay} videos</li>
                <li>• {projectConfig.bufferVideos} buffer videos</li>
                <li>• <strong>Total: {totalVideosNeeded} topics to generate</strong></li>
                <li>• Production: {
                  projectConfig.productionMode === 'traditional' ? '🎥 Traditional Filming' :
                  projectConfig.productionMode === 'ai-voice' ? '🤖 AI Voice + Stock' :
                  '✨ Fully AI-Generated'
                }</li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateTopics}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Generating Topics...' : `Generate ${totalVideosNeeded} Topics`}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}