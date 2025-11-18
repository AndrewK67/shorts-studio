import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import TopicSelector from './TopicSelector' // Import our new component

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

  const { data: project, error } = await supabase
    .from('projects')
    .select(`*, topics (*)`)
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .single()

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.month} • {project.production_mode}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Topics List */}
          <div className="lg:col-span-2 space-y-6">
            <TopicSelector topics={project.topics} projectId={project.id} />
          </div>

          {/* Sidebar Stats */}
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