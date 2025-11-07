'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ScriptsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  // 1. Add state to track selected scripts
  const [selectedScriptIds, setSelectedScriptIds] = useState<string[]>([])

  useEffect(() => {
    // ... (your existing useEffect is perfect)
  }, [params.id, router])

  // 2. Add functions to handle selection
  const handleSelectScript = (scriptId: string) => {
    setSelectedScriptIds((prev) =>
      prev.includes(scriptId)
        ? prev.filter((id) => id !== scriptId)
        : [...prev, scriptId]
    )
  }

  const handleSelectAll = () => {
    if (selectedScriptIds.length === scripts.length) {
      setSelectedScriptIds([])
    } else {
      setSelectedScriptIds(scripts.map((s: any) => s.topicId)) // Use a unique ID
    }
  }

  const handleCreateBatchPlan = async () => {
    // 3. Check selection
    if (selectedScriptIds.length === 0) {
      alert('Please select at least one script to include in the batch plan.')
      return
    }

    setGeneratingPlan(true)

    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      
      // 4. Filter scripts based on selection
      const selectedScripts = project.scripts.filter((s: any) =>
        selectedScriptIds.includes(s.topicId)
      )

      const response = await fetch('/api/batch-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 5. Send only the selected scripts
          scripts: selectedScripts,
          profile,
          filmingHours: 8,
        }),
      })

      // ... (rest of your function is perfect)
    } catch (error) {
      // ... (your error handling)
    } finally {
      setGeneratingPlan(false)
    }
  }

  if (!project) {
    // ... (your loading state)
  }

  const scripts = project.scripts || []
  const hasBatchPlan = project.batchPlan

  return (
    <div className="min-h-screen bg-gray-50">
      <header>{/* ... (your header) ... */}</header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          {/* ... (your View Batch Plan link) ... */}
          
          {scripts.length >= 3 && (
            <button
              onClick={handleCreateBatchPlan}
              disabled={generatingPlan || selectedScriptIds.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {generatingPlan
                ? 'Creating Batch Plan...'
                : `Create Batch Plan (${selectedScriptIds.length})`}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Scripts ({scripts.length})
            </h2>
            {/* 6. Add a "Select All" button */}
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedScriptIds.length === scripts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {scripts.length === 0 ? (
            <div>{/* ... (your empty state) ... */}</div>
          ) : (
            <div className="space-y-4">
              {scripts.map((script: any, index: number) => {
                const scriptId = script.topicId // Use a unique ID
                return (
                  <div
                    key={index}
                    className={`p-6 border rounded-lg transition-all flex gap-4 ${
                      selectedScriptIds.includes(scriptId)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 7. Add the checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedScriptIds.includes(scriptId)}
                      onChange={() => handleSelectScript(scriptId)}
                      className="mt-1 rounded"
                    />
                    <Link
                      href={`/dashboard/project/${params.id}/scripts/${index}`}
                      className="block flex-1"
                    >
                      {/* ... (your existing script card content) ... */}
                      <h3 className="text-lg font-semibold text-gray-900">{script.topicTitle}</h3>
                      {/* ... */}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
          {/* ... (rest of your component) ... */}
        </div>
      </main>
    </div>
  )
}