'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Topic {
  id: string
  title: string
  hook: string
  tone: string
}

interface TopicSelectorProps {
  topics: Topic[]
  projectId: string
}

export default function TopicSelector({ topics, projectId }: TopicSelectorProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleTopic = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === topics.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(topics.map(t => t.id)))
    }
  }

  const handleGenerateScripts = async () => {
    if (selectedIds.size === 0) return
    
    setIsGenerating(true)
    
    // TODO: Here we will eventually call the API to generate scripts.
    // For now, we'll just show an alert to confirm selection works.
    alert(`Ready to generate scripts for ${selectedIds.size} topics!\n(Script generation logic coming next)`)
    
    setIsGenerating(false)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Generated Topics</h2>
        <div className="flex gap-2">
             <button 
               onClick={toggleAll}
               className="text-sm text-blue-600 hover:text-blue-800 font-medium"
             >
               {selectedIds.size === topics.length ? 'Deselect All' : 'Select All'}
             </button>
        </div>
      </div>

      {topics.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {topics.map((topic) => (
            <li key={topic.id} className="py-4 flex items-start hover:bg-gray-50 transition-colors rounded-md px-2 -mx-2">
              <div className="flex items-center h-5 mt-1">
                <input
                  id={`topic-${topic.id}`}
                  name={`topic-${topic.id}`}
                  type="checkbox"
                  checked={selectedIds.has(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                  className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 flex-1 cursor-pointer" onClick={() => toggleTopic(topic.id)}>
                 <label htmlFor={`topic-${topic.id}`} className="font-medium text-gray-900 block cursor-pointer">
                   {topic.title}
                 </label>
                 <p className="text-sm text-gray-500 mt-1">{topic.hook}</p>
                 <div className="mt-2">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                     {topic.tone || 'General'}
                   </span>
                 </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No topics found for this project.</p>
      )}
      
      <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white">
         <button
           onClick={handleGenerateScripts}
           disabled={selectedIds.size === 0 || isGenerating}
           className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors shadow-sm ${
             selectedIds.size === 0 
               ? 'bg-gray-300 cursor-not-allowed' 
               : 'bg-blue-600 hover:bg-blue-700'
           }`}
         >
           {isGenerating ? 'Starting Generation...' : `Generate Scripts for ${selectedIds.size} Selected`}
         </button>
      </div>
    </div>
  )
}