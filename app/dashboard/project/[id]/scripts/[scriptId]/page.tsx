'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ScriptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [script, setScript] = useState<any>(null)

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const currentProject = projects.find((p: any) => p.id === params.id)
    
    if (currentProject) {
      setProject(currentProject)
      const scriptIndex = parseInt(params.scriptId as string)
      if (currentProject.scripts && currentProject.scripts[scriptIndex]) {
        setScript(currentProject.scripts[scriptIndex])
      }
    } else {
      router.push('/dashboard')
    }
  }, [params.id, params.scriptId, router])

  if (!project || !script) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const productionMode = script.productionMode || project.productionMode || 'traditional'
  const isAIVoice = productionMode === 'ai-voice'
  const isAIVideo = productionMode === 'ai-video'
  const isTraditional = productionMode === 'traditional'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/dashboard/project/${params.id}/scripts`} className="text-gray-600 hover:text-gray-900 inline-block mb-4">
            ← Back to Scripts
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{script.topicTitle}</h1>
              <p className="text-sm text-gray-600">Reading time: {script.readingTime} seconds</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isAIVideo ? 'bg-purple-100 text-purple-800' :
                isAIVoice ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {isAIVideo ? '✨ AI Video' : isAIVoice ? '🤖 AI Voice' : '🎥 Traditional'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Script */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Script</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">HOOK (0-3s)</h3>
                  <p className="text-gray-900 bg-yellow-50 p-4 rounded-lg">{script.hook}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">SETUP (3-10s)</h3>
                  <p className="text-gray-900 bg-blue-50 p-4 rounded-lg">{script.setup}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">VALUE (10-50s)</h3>
                  <p className="text-gray-900 bg-green-50 p-4 rounded-lg whitespace-pre-line">{script.value}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">CTA (50-60s)</h3>
                  <p className="text-gray-900 bg-purple-50 p-4 rounded-lg">{script.cta}</p>
                </div>
              </div>
            </div>

            {/* Full Script */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Script</h2>
              <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm whitespace-pre-line">
                {script.fullScript}
              </div>
            </div>
          </div>

          {/* Sidebar - Notes */}
          <div className="space-y-6">
            {/* Delivery Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Delivery Notes</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Pacing:</p>
                  <p className="text-gray-600">{script.deliveryNotes.pacing}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Energy Level:</p>
                  <p className="text-gray-600">{script.deliveryNotes.energy}/10</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Key Pauses:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    {script.deliveryNotes.pauses.map((pause: string, i: number) => (
                      <li key={i}>{pause}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Emphasis:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    {script.deliveryNotes.emphasis.map((word: string, i: number) => (
                      <li key={i}>{word}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Visual Cues - Traditional Mode */}
            {isTraditional && script.visualCues && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">🎬 Visual Cues (On Camera)</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Framing:</p>
                    <p className="text-gray-600">{script.visualCues.framing}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Lighting:</p>
                    <p className="text-gray-600">{script.visualCues.lighting}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Gestures:</p>
                    <ul className="text-gray-600 list-disc list-inside">
                      {script.visualCues.gestures?.map((gesture: string, i: number) => (
                        <li key={i}>{gesture}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">B-Roll:</p>
                    <ul className="text-gray-600 list-disc list-inside">
                      {script.visualCues.bRoll?.map((broll: string, i: number) => (
                        <li key={i}>{broll}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Production - AI Voice Mode */}
            {isAIVoice && script.visualCues && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">🎨 Stock Footage Guide</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-800">Search Keywords:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {script.visualCues.stockFootageKeywords?.map((keyword: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {script.visualCues.sceneDescriptions && (
                    <div>
                      <p className="font-medium text-blue-800">Scene Descriptions:</p>
                      <ul className="text-blue-700 list-disc list-inside mt-2">
                        {script.visualCues.sceneDescriptions.map((scene: string, i: number) => (
                          <li key={i}>{scene}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {script.visualCues.textOverlays && (
                    <div>
                      <p className="font-medium text-blue-800">Text Overlays:</p>
                      <ul className="text-blue-700 list-disc list-inside mt-2">
                        {script.visualCues.textOverlays.map((text: string, i: number) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {script.visualCues.musicMood && (
                    <div>
                      <p className="font-medium text-blue-800">Music Mood:</p>
                      <p className="text-blue-700">{script.visualCues.musicMood}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Stock Sources:</strong> Pexels, Pixabay, Storyblocks
                  </p>
                </div>
              </div>
            )}

            {/* AI Video Generation - AI Video Mode */}
            {isAIVideo && script.visualCues && script.visualCues.aiPrompts && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-purple-900 mb-4">✨ AI Video Generation Prompts</h2>
                <div className="space-y-4">
                  {script.visualCues.aiPrompts.map((aiPrompt: any, i: number) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-purple-900 capitalize">{aiPrompt.section}</p>
                        <span className="text-xs text-purple-600">{aiPrompt.duration}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{aiPrompt.prompt}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {aiPrompt.style?.split(',').map((style: string, j: number) => (
                          <span key={j} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {style.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-purple-700 mb-2">
                    💡 <strong>Recommended Tools:</strong>
                  </p>
                  <ul className="text-xs text-purple-600 space-y-1">
                    <li>• Runway Gen-3 (cinematic)</li>
                    <li>• Pika 2.0 (character consistency)</li>
                    <li>• HeyGen (talking heads)</li>
                  </ul>
                </div>

                {script.visualCues.textOverlays && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="font-medium text-purple-800 text-sm mb-2">Text Overlays:</p>
                    <ul className="text-purple-700 list-disc list-inside text-sm">
                      {script.visualCues.textOverlays.map((text: string, i: number) => (
                        <li key={i}>{text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Fact-Check */}
            {script.factCheckNotes.claims.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Fact-Check</h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-yellow-800">Claims to Verify:</p>
                  <ul className="text-yellow-700 list-disc list-inside">
                    {script.factCheckNotes.claims.map((claim: string, i: number) => (
                      <li key={i}>{claim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}