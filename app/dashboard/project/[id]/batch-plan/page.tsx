'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../../../../components/Navigation'

interface Cluster {
  id: string
  name: string
  scripts: any[]
  outfit: string
  location: string
  lighting: string
  props: string[]
  energyLevel: number
  estimatedMinutes: number
  notes: string
}

export default function BatchPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [setupTime, setSetupTime] = useState(30) // minutes
  const [breakTime, setBreakTime] = useState(15) // minutes between clusters
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

  useEffect(() => {
    loadProject()
  }, [params.id])

  const loadProject = () => {
    try {
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const currentProject = projects.find((p: any) => p.id === params.id)
        
        if (currentProject) {
          setProject(currentProject)
          
          // Check if batch plan already exists
          if (currentProject.batchPlan?.clusters) {
            setClusters(currentProject.batchPlan.clusters)
            calculateTotalTime(currentProject.batchPlan.clusters)
          }
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setLoading(false)
    }
  }

  const generateBatchPlan = () => {
    if (!project || !project.scripts || project.scripts.length === 0) {
      alert('No scripts available to create a batch plan. Please generate scripts first.')
      return
    }

    setGenerating(true)

    // Group scripts by tone and energy level
    const scriptsByTone: { [key: string]: any[] } = {}
    
    project.scripts.forEach((script: any) => {
      const tone = script.tone || 'General'
      if (!scriptsByTone[tone]) {
        scriptsByTone[tone] = []
      }
      scriptsByTone[tone].push(script)
    })

    // Create clusters
    const newClusters: Cluster[] = []
    let clusterId = 1

    Object.entries(scriptsByTone).forEach(([tone, scripts]) => {
      // Further split by energy level if there are many scripts
      if (scripts.length > 8) {
        const highEnergy = scripts.filter((s: any) => (s.deliveryNotes?.energy || 5) >= 7)
        const medEnergy = scripts.filter((s: any) => {
          const energy = s.deliveryNotes?.energy || 5
          return energy >= 4 && energy < 7
        })
        const lowEnergy = scripts.filter((s: any) => (s.deliveryNotes?.energy || 5) < 4)

        if (highEnergy.length > 0) {
          newClusters.push(createCluster(clusterId++, `${tone} - High Energy`, highEnergy, tone, 8))
        }
        if (medEnergy.length > 0) {
          newClusters.push(createCluster(clusterId++, `${tone} - Medium Energy`, medEnergy, tone, 5))
        }
        if (lowEnergy.length > 0) {
          newClusters.push(createCluster(clusterId++, `${tone} - Low Energy`, lowEnergy, tone, 3))
        }
      } else {
        newClusters.push(createCluster(clusterId++, tone, scripts, tone, 5))
      }
    })

    setClusters(newClusters)
    calculateTotalTime(newClusters)
    saveBatchPlan(newClusters)
    setGenerating(false)
  }

  const createCluster = (id: number, name: string, scripts: any[], tone: string, defaultEnergy: number): Cluster => {
    const avgEnergy = scripts.reduce((sum, s) => sum + (s.deliveryNotes?.energy || defaultEnergy), 0) / scripts.length
    const totalScriptTime = scripts.reduce((sum, s) => sum + (s.readingTime || 60), 0)
    
    // Estimate 2x reading time for multiple takes + setup
    const estimatedMinutes = Math.ceil((totalScriptTime / 60) * 2) + 5

    return {
      id: `cluster-${id}`,
      name,
      scripts,
      outfit: suggestOutfit(tone, avgEnergy),
      location: suggestLocation(tone),
      lighting: suggestLighting(tone, avgEnergy),
      props: suggestProps(scripts),
      energyLevel: Math.round(avgEnergy),
      estimatedMinutes,
      notes: ''
    }
  }

  const suggestOutfit = (tone: string, energy: number): string => {
    if (tone.toLowerCase().includes('educational')) return 'Professional attire (button-up shirt)'
    if (tone.toLowerCase().includes('humor')) return 'Casual, comfortable clothing'
    if (energy > 7) return 'Bright colors, energetic style'
    if (energy < 4) return 'Soft colors, cozy style'
    return 'Smart casual'
  }

  const suggestLocation = (tone: string): string => {
    if (tone.toLowerCase().includes('educational')) return 'Desk/office setup with bookshelf'
    if (tone.toLowerCase().includes('calming')) return 'Natural light area, minimal background'
    if (tone.toLowerCase().includes('storytelling')) return 'Comfortable seating area'
    return 'Well-lit indoor space'
  }

  const suggestLighting = (tone: string, energy: number): string => {
    if (energy > 7) return 'Bright, clear lighting'
    if (energy < 4) return 'Soft, warm lighting'
    if (tone.toLowerCase().includes('educational')) return 'Professional 3-point lighting'
    return 'Natural window light with fill'
  }

  const suggestProps = (scripts: any[]): string[] => {
    const props = new Set<string>()
    
    scripts.forEach((script: any) => {
      if (script.visualCues) {
        if (Array.isArray(script.visualCues)) {
          script.visualCues.forEach((cue: string) => {
            if (cue.toLowerCase().includes('show')) {
              props.add(cue)
            }
          })
        } else if (script.visualCues.bRoll) {
          script.visualCues.bRoll.forEach((item: string) => props.add(item))
        }
      }
    })

    return Array.from(props).slice(0, 5)
  }

  const calculateTotalTime = (clusterList: Cluster[]) => {
    const clusterTime = clusterList.reduce((sum, c) => sum + c.estimatedMinutes, 0)
    const breaks = (clusterList.length - 1) * breakTime
    const total = setupTime + clusterTime + breaks
    setTotalTime(total)
  }

  const saveBatchPlan = (clusterList: Cluster[]) => {
    try {
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const projectIndex = projects.findIndex((p: any) => p.id === params.id)
        
        if (projectIndex !== -1) {
          projects[projectIndex].batchPlan = {
            clusters: clusterList,
            setupTime,
            breakTime,
            totalTime,
            createdAt: new Date().toISOString()
          }
          
          localStorage.setItem('projects', JSON.stringify(projects))
          console.log('Batch plan saved successfully')
        }
      }
    } catch (err) {
      console.error('Error saving batch plan:', err)
    }
  }

  const updateCluster = (clusterId: string, field: string, value: any) => {
    const updatedClusters = clusters.map(c => 
      c.id === clusterId ? { ...c, [field]: value } : c
    )
    setClusters(updatedClusters)
    saveBatchPlan(updatedClusters)
  }

  const exportChecklist = () => {
    if (!project || clusters.length === 0) return

    let checklistText = `
BATCH PRODUCTION PLAN
${project.name || 'Untitled Project'}
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

OVERVIEW
• Total Videos: ${project.scripts?.length || 0}
• Number of Clusters: ${clusters.length}
• Estimated Total Time: ${Math.floor(totalTime / 60)}h ${totalTime % 60}m
• Setup Time: ${setupTime} minutes
• Break Time: ${breakTime} minutes between clusters

═══════════════════════════════════════════════════════════

PRE-FILMING CHECKLIST
[ ] Camera fully charged (+ backup battery)
[ ] Microphone tested
[ ] Lighting equipment set up
[ ] Memory cards cleared
[ ] Props gathered and organized
[ ] Outfits prepared (${clusters.length} looks)
[ ] Scripts reviewed
[ ] Filming location prepared

═══════════════════════════════════════════════════════════

FILMING SCHEDULE
`

    let currentTime = 0
    checklistText += `\n${formatTime(currentTime)} - Setup & Equipment Check (${setupTime} min)\n`
    currentTime += setupTime

    clusters.forEach((cluster, index) => {
      checklistText += `\n${formatTime(currentTime)} - CLUSTER ${index + 1}: ${cluster.name}\n`
      checklistText += `Duration: ${cluster.estimatedMinutes} minutes\n`
      checklistText += `Videos: ${cluster.scripts.length}\n`
      checklistText += `Outfit: ${cluster.outfit}\n`
      checklistText += `Location: ${cluster.location}\n`
      checklistText += `Lighting: ${cluster.lighting}\n`
      checklistText += `Energy Level: ${cluster.energyLevel}/10\n`
      
      if (cluster.props.length > 0) {
        checklistText += `Props: ${cluster.props.join(', ')}\n`
      }
      
      checklistText += '\nVideos in this cluster:\n'
      cluster.scripts.forEach((script, i) => {
        checklistText += `  ${i + 1}. ${script.topicTitle || script.hook?.substring(0, 40) || 'Untitled'}\n`
        checklistText += `     Reading time: ${script.readingTime || 60}s\n`
      })
      
      currentTime += cluster.estimatedMinutes
      
      if (index < clusters.length - 1) {
        checklistText += `\n${formatTime(currentTime)} - Break & Outfit Change (${breakTime} min)\n`
        currentTime += breakTime
      }
    })

    checklistText += `\n═══════════════════════════════════════════════════════════\n`
    checklistText += `\nPOST-FILMING CHECKLIST\n`
    checklistText += `[ ] All videos captured\n`
    checklistText += `[ ] Backup footage to computer\n`
    checklistText += `[ ] Review for any re-shoots needed\n`
    checklistText += `[ ] Clean and pack equipment\n`
    checklistText += `[ ] Reset filming location\n`

    const blob = new Blob([checklistText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-plan-${project.name || Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/dashboard/project/${params.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Project
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Batch Production Plan</h1>
              <p className="text-sm text-gray-600 mt-1">
                {project.scripts?.length || 0} videos • {clusters.length} clusters • {Math.floor(totalTime / 60)}h {totalTime % 60}m total
              </p>
            </div>
            <div className="flex gap-3">
              {clusters.length === 0 ? (
                <button
                  onClick={generateBatchPlan}
                  disabled={generating || !project.scripts || project.scripts.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Batch Plan'}
                </button>
              ) : (
                <>
                  <button
                    onClick={generateBatchPlan}
                    disabled={generating}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={exportChecklist}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Export Checklist
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {clusters.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batch Plan Yet</h3>
            <p className="text-gray-600 mb-6">
              Generate a batch production plan to organize your {project.scripts?.length || 0} scripts for efficient filming
            </p>
            {(!project.scripts || project.scripts.length === 0) ? (
              <p className="text-sm text-red-600 mb-4">
                You need to generate scripts first before creating a batch plan.
              </p>
            ) : null}
            <button
              onClick={generateBatchPlan}
              disabled={!project.scripts || project.scripts.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Batch Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setup Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={setupTime}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      setSetupTime(val)
                      calculateTotalTime(clusters)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={breakTime}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      setBreakTime(val)
                      calculateTotalTime(clusters)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Production Time
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-900">
                    {Math.floor(totalTime / 60)}h {totalTime % 60}m
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filming Timeline</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-700 w-16">00:00</span>
                  <span className="text-sm text-gray-900">Setup & Equipment Check</span>
                  <span className="text-xs text-gray-500 ml-auto">{setupTime} min</span>
                </div>
                
                {clusters.map((cluster, index) => {
                  const clusterStartTime = setupTime + clusters.slice(0, index).reduce((sum, c) => sum + c.estimatedMinutes, 0) + (index * breakTime)
                  const breakStartTime = clusterStartTime + cluster.estimatedMinutes
                  
                  return (
                    <div key={cluster.id}>
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <span className="text-sm font-mono text-gray-700 w-16">{formatTime(clusterStartTime)}</span>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">{cluster.name}</span>
                          <span className="text-xs text-gray-600 ml-2">({cluster.scripts.length} videos)</span>
                        </div>
                        <span className="text-xs text-gray-500">{cluster.estimatedMinutes} min</span>
                      </div>
                      
                      {index < clusters.length - 1 && (
                        <div className="flex items-center gap-4 p-2 bg-yellow-50 rounded-lg ml-20">
                          <span className="text-xs font-mono text-gray-600 w-16">{formatTime(breakStartTime)}</span>
                          <span className="text-xs text-gray-700">Break & Outfit Change</span>
                          <span className="text-xs text-gray-500 ml-auto">{breakTime} min</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Clusters */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Production Clusters</h2>
              
              {clusters.map((cluster, index) => (
                <div key={cluster.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cluster {index + 1}: {cluster.name}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {cluster.scripts.length} videos
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {cluster.estimatedMinutes} min
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Energy: {cluster.energyLevel}/10
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Outfit</p>
                            <p className="text-gray-900 font-medium">{cluster.outfit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Location</p>
                            <p className="text-gray-900 font-medium">{cluster.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Lighting</p>
                            <p className="text-gray-900 font-medium">{cluster.lighting}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Props</p>
                            <p className="text-gray-900 font-medium">{cluster.props.length || 'None'}</p>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedCluster === cluster.id ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {expandedCluster === cluster.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                      {/* Editable Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Outfit</label>
                          <input
                            type="text"
                            value={cluster.outfit}
                            onChange={(e) => updateCluster(cluster.id, 'outfit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={cluster.location}
                            onChange={(e) => updateCluster(cluster.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                          <input
                            type="text"
                            value={cluster.lighting}
                            onChange={(e) => updateCluster(cluster.id, 'lighting', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (min)</label>
                          <input
                            type="number"
                            value={cluster.estimatedMinutes}
                            onChange={(e) => {
                              updateCluster(cluster.id, 'estimatedMinutes', parseInt(e.target.value) || 0)
                              calculateTotalTime(clusters)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Props Needed</label>
                        <div className="flex flex-wrap gap-2">
                          {cluster.props.map((prop, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                              {prop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={cluster.notes}
                          onChange={(e) => updateCluster(cluster.id, 'notes', e.target.value)}
                          placeholder="Add any special notes for this cluster..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>

                      {/* Scripts in this cluster */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Scripts in This Cluster</h4>
                        <div className="space-y-2">
                          {cluster.scripts.map((script, scriptIndex) => (
                            <div key={scriptIndex} className="p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {scriptIndex + 1}. {script.topicTitle || 'Untitled'}
                                  </p>
                                  <p className="text-xs text-gray-600 italic mt-1">
                                    "{script.hook?.substring(0, 60)}..."
                                  </p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {script.readingTime || 60}s
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pre-Filming Checklist */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pre-Filming Checklist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Camera fully charged (+ backup battery)',
                  'Microphone tested',
                  'Lighting equipment set up',
                  'Memory cards cleared',
                  'Props gathered and organized',
                  `Outfits prepared (${clusters.length} looks)`,
                  'Scripts reviewed',
                  'Filming location prepared'
                ].map((item, index) => (
                  <label key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
