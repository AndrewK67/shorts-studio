'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string>('')

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]')
    setProfiles(savedProfiles)
    
    const activeId = localStorage.getItem('activeProfileId') || ''
    setActiveProfileId(activeId)
  }, [])

  const handleSetActive = (profileId: string) => {
    localStorage.setItem('activeProfileId', profileId)
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile))
    }
    setActiveProfileId(profileId)
    router.push('/dashboard')
  }

  const handleDelete = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      const updated = profiles.filter(p => p.id !== profileId)
      setProfiles(updated)
      localStorage.setItem('userProfiles', JSON.stringify(updated))
      
      if (activeProfileId === profileId) {
        localStorage.removeItem('activeProfileId')
        localStorage.removeItem('userProfile')
        setActiveProfileId('')
      }
    }
  }

  const handleCreateNew = () => {
    router.push('/onboarding?new=true')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Profiles</h2>
              <p className="text-gray-600 mt-1">Switch between different content themes</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Create New Profile
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
              <p className="text-gray-600 mb-6">Create your first profile to get started</p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create First Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    activeProfileId === profile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {profile.profileName || profile.name}
                      </h3>
                      {activeProfileId === profile.id && (
                        <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>User:</strong> {profile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Channel:</strong> {profile.channelName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Niche:</strong> {profile.niche}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {profile.location}, {profile.country}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Primary Tone:</strong> {profile.primaryTone}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {activeProfileId !== profile.id && (
                      <button
                        onClick={() => handleSetActive(profile.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        Set as Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How Profiles Work</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Each profile has its own niche, voice, and settings</li>
            <li>• Only one profile is "active" at a time</li>
            <li>• New projects use the active profile</li>
            <li>• Switch profiles anytime to create different content themes</li>
          </ul>
        </div>
      </main>
    </div>
  )
}