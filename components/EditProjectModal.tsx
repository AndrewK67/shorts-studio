'use client'

import { useState, useEffect } from 'react'

// Define the types for props
interface ToneMix {
  [key: string]: number
}

interface Project {
  id: string
  name: string
  productionMode: string
  toneMix: ToneMix
  // ... any other fields you want to edit
}

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: Project) => void
}

export default function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSave,
}: EditProjectModalProps) {
  // Use state to manage the form data
  const [formData, setFormData] = useState(project)

  // Update state if the project prop changes
  useEffect(() => {
    setFormData(project)
  }, [project])

  if (!isOpen) return null

  const handleToneChange = (tone: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      toneMix: {
        ...prev.toneMix,
        [tone]: parseInt(value) || 0,
      },
    }))
  }

  const handleSaveClick = () => {
    onSave(formData)
    onClose()
  }

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 m-4 max-w-2xl w-full z-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Project: {project.name}
        </h2>

        <div className="space-y-6">
          {/* Production Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Mode
            </label>
            <select
              value={formData.productionMode}
              onChange={(e) =>
                setFormData({ ...formData, productionMode: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="traditional">🎥 Traditional Filming</option>
              <option value="ai-voice">🤖 AI Voice + Stock Footage</option>
              <option value="ai-video">✨ Fully AI-Generated</option>
            </select>
          </div>

          {/* Tone Mix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Tone Mix
            </label>
            <div className="space-y-4">
              {Object.entries(formData.toneMix).map(([tone, value]) => (
                <div key={tone}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {tone}
                    </span>
                    <span className="text-sm text-gray-600">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleToneChange(tone, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}