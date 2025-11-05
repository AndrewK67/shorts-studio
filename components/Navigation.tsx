'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Shorts Studio
            </Link>
            
            <div className="hidden md:flex gap-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                href="/profiles"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/profiles')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Profiles
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <select
              onChange={(e) => window.location.href = e.target.value}
              value={pathname}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="/">Home</option>
              <option value="/dashboard">Dashboard</option>
              <option value="/profiles">Profiles</option>
              <option value="/onboarding">New Profile</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}