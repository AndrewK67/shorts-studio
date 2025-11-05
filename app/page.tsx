'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to Shorts Studio
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Your AI-powered content planning assistant for YouTube Shorts.
              Create authentic, engaging content that resonates with your audience.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/onboarding"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}