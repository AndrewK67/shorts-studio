import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetches projects and uses the correct 'profile_id' for security
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link 
            href="/dashboard/new-project"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + New Project
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/project/${project.id}`}>
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow p-6 cursor-pointer block">
                  {/* THE FIX: Using project.name instead of project.title */}
                  <h3 className="text-lg font-medium text-gray-900">{project.name || 'Untitled Project'}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{project.production_mode}</span>
                    <span className="mx-2">•</span>
                    <span>{project.month}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <Link href="/dashboard/new-project" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Create Project
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}