import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import TopicSelector from './TopicSelector'

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

  // 1. Fetch Project and Topics
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`*, topics (*)`)
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .single()

  // 2. Fetch User Profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (projectError || !project || profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>
    )
  }

  // Map the profile data for consistency
  const mappedProfile = {
    ...profile,
    uniqueAngle: profile.unique_angle,
    languageVariant: profile.language_variant,
    targetAudience: profile.target_audience,
    signatureTone: profile.signature_tone || {},
    wontCover: profile.wont_cover || [],
    catchphrases: profile.catchphrases || [],
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
          <div className="lg:col-span-2 space-y-6">
            {/* PASSING PROFILE DOWN: Now TopicSelector has the profile data it needs */}
            <TopicSelector 
              topics={project.topics} 
              projectId={project.id} 
              productionMode={project.production_mode} 
              userProfile={mappedProfile}
            />
          </div>

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
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}