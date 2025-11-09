import { createClient } from '@/lib/supabase/client'

export interface Project {
  id: string
  user_id: string
  profile_id: string
  name: string
  month: string
  videos_needed: number
  tone_mix: Record<string, number> | null
  status: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
  created_at: string
  updated_at: string
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(profileId?: string): Promise<Project[]> {
  const supabase = createClient()

  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

/**
 * Create a new project
 */
export async function createProject(
  userId: string,
  profileId: string,
  projectData: {
    name: string
    month: string
    videos_needed: number
    tone_mix?: Record<string, number>
    status?: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
  }
): Promise<Project> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      profile_id: profileId,
      ...projectData,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return data
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Project> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return data
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

/**
 * Get project statistics (topic and script counts)
 */
export async function getProjectStats(profileId?: string): Promise<{
  totalTopics: number
  totalScripts: number
}> {
  const supabase = createClient()

  // Get topic count
  let topicsQuery = supabase
    .from('topics')
    .select('id', { count: 'exact', head: true })

  if (profileId) {
    // Filter by profile through projects
    topicsQuery = topicsQuery
      .in('project_id',
        supabase
          .from('projects')
          .select('id')
          .eq('profile_id', profileId)
      )
  }

  const { count: topicCount } = await topicsQuery

  // Get script count
  let scriptsQuery = supabase
    .from('scripts')
    .select('id', { count: 'exact', head: true })

  if (profileId) {
    scriptsQuery = scriptsQuery
      .in('project_id',
        supabase
          .from('projects')
          .select('id')
          .eq('profile_id', profileId)
      )
  }

  const { count: scriptCount } = await scriptsQuery

  return {
    totalTopics: topicCount || 0,
    totalScripts: scriptCount || 0,
  }
}
