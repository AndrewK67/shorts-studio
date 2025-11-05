'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BatchPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const currentProject = projects.find((p: any) => p.id === params.id)
    
    if (currentProject) {
      setProject(currentProject)
    } else {
      router.push('/dashboard')
    }
  }, [params.id, router])

  if (!project || !project.batchPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No batch plan found</p>
          <Link
            href={`/dashboard/project/${params.id}/scripts`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back and create a batch plan →
          </Link>
        </div>
      </div>
    )
  }

  const { batchPlan } = project
  const { summary, clusters, timeline, checklist } = batchPlan

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/dashboard/project/${params.id}/scripts`} className="text-gray-600 hover:text-gray-900 inline-block mb-4">
            ← Back to Scripts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Batch Filming Plan</h1>
          <p className="text-gray-600 mt-1">{project.name}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">📊 Filming Day Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-purple-100 text-sm">Total Videos</p>
              <p className="text-3xl font-bold">{summary.totalVideos}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Clusters</p>
              <p className="text-3xl font-bold">{summary.totalClusters}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Estimated Time</p>
              <p className="text-3xl font-bold">{summary.estimatedTime}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Breaks</p>
              <p className="text-3xl font-bold">{summary.breakCount}</p>
            </div>
          </div>
        </div>

        {/* Clusters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎬 Filming Clusters</h2>
          <div className="space-y-6">
            {clusters.map((cluster: any) => (
              <div key={cluster.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{cluster.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{cluster.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Videos: {cluster.videoCount}</p>
                    <p className="text-sm font-medium text-purple-600">{cluster.estimatedTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">👕 Outfit:</p>
                    <p className="text-sm text-gray-600">{cluster.outfit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">📍 Location:</p>
                    <p className="text-sm text-gray-600">{cluster.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">💡 Lighting:</p>
                    <p className="text-sm text-gray-600">{cluster.lighting}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">⚡ Energy:</p>
                    <p className="text-sm text-gray-600">{cluster.energy}</p>
                  </div>
                </div>

                {cluster.props && cluster.props.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">🎨 Props Needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {cluster.props.map((prop: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cluster.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> {cluster.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⏱️ Filming Timeline</h2>
          <div className="space-y-2">
            {timeline.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  item.type === 'setup' ? 'bg-blue-50' :
                  item.type === 'filming' ? 'bg-green-50' :
                  'bg-yellow-50'
                }`}
              >
                <div className="font-mono text-sm font-semibold text-gray-700 w-24">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.activity}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.type === 'setup' ? 'bg-blue-200 text-blue-800' :
                    item.type === 'filming' ? 'bg-green-200 text-green-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Filming Checklist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Pre-Filming</h3>
              <ul className="space-y-2">
                {checklist.preFilming.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Per Cluster</h3>
              <ul className="space-y-2">
                {checklist.perCluster.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Post-Filming</h3>
              <ul className="space-y-2">
                {checklist.postFilming.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}