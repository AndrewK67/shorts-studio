import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation' // Adjust path if needed

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the specific project
  // We select '*' to get all columns (id, name, month, etc.)
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      topics (*) 
    `) // Also fetch related topics
    .eq('id', params.id)
    .eq('profile_id', user.id) // Security check: ensure user owns it
    .single()

  if (error || !project) {
    console.error('Error fetching project:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <p className="text-gray-600 mb-8">This project does not exist or you do not have permission to view it.</p>
        <Link 
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header / Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">
                {project.month} • {project.production_mode}
              </p>
            </div>
            
            {/* Action Buttons (Placeholders for now) */}
            <div className="flex gap-3">
               <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium">
                 Edit Settings
               </button>
               <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                 Generate Scripts
               </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Topics List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Topics</h2>
              
              {project.topics && project.topics.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {project.topics.map((topic: any) => (
                    <li key={topic.id} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{topic.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{topic.hook}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {topic.tone || 'General'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No topics found for this project.</p>
              )}
            </div>
          </div>

          {/* Sidebar: Project Stats */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Project Stats</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-gray-500">Videos Needed</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{project.videos_needed}</dd>
                </div>
                 <div>
                  <dt className="text-xs text-gray-500">Topics Generated</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{project.topics?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Tone Mix</dt>
                  <dd className="mt-2">
                    {project.tone_mix && Object.entries(project.tone_mix).map(([tone, val]: any) => (
                      <div key={tone} className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-gray-600">{tone}</span>
                        <span className="font-medium text-gray-900">{val}%</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}