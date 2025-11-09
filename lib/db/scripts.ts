import { createClient } from '@/lib/supabase/client'

export interface Script {
  id: string
  topic_id: string
  project_id: string
  content: string
  hook: string | null
  reading_time: number | null
  delivery_notes: Record<string, any> | null
  visual_cues: Record<string, any> | null
  fact_check_notes: Record<string, any> | null
  verification_status: 'verified' | 'needs_review' | 'pending'
  verified_at: string | null
  version: number
  parent_script_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all scripts for a project
 */
export async function getScriptsByProjectId(projectId: string): Promise<Script[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching scripts:', error)
    throw error
  }

  return data || []
}

/**
 * Get all scripts for a specific topic
 */
export async function getScriptsByTopicId(topicId: string): Promise<Script[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('topic_id', topicId)
    .order('version', { ascending: false }) // Latest version first

  if (error) {
    console.error('Error fetching scripts for topic:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific script by ID
 */
export async function getScriptById(scriptId: string): Promise<Script | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', scriptId)
    .single()

  if (error) {
    console.error('Error fetching script:', error)
    return null
  }

  return data
}

/**
 * Create scripts in bulk (from AI generation)
 */
export async function createScripts(
  projectId: string,
  scripts: Array<{
    topic_id: string
    content: string
    hook?: string
    reading_time?: number
    delivery_notes?: Record<string, any>
    visual_cues?: Record<string, any>
    fact_check_notes?: Record<string, any>
    verification_status?: 'verified' | 'needs_review' | 'pending'
  }>
): Promise<Script[]> {
  const supabase = createClient()

  const scriptsWithProjectId = scripts.map(script => ({
    project_id: projectId,
    ...script,
  }))

  const { data, error } = await supabase
    .from('scripts')
    .insert(scriptsWithProjectId)
    .select()

  if (error) {
    console.error('Error creating scripts:', error)
    throw error
  }

  return data
}

/**
 * Update a script
 */
export async function updateScript(
  scriptId: string,
  updates: Partial<Omit<Script, 'id' | 'topic_id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<Script> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scripts')
    .update(updates)
    .eq('id', scriptId)
    .select()
    .single()

  if (error) {
    console.error('Error updating script:', error)
    throw error
  }

  return data
}

/**
 * Delete a script
 */
export async function deleteScript(scriptId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', scriptId)

  if (error) {
    console.error('Error deleting script:', error)
    throw error
  }
}

/**
 * Mark script as verified
 */
export async function verifyScript(
  scriptId: string,
  notes?: Record<string, any>
): Promise<Script> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scripts')
    .update({
      verification_status: 'verified',
      fact_check_notes: notes || null,
      verified_at: new Date().toISOString(),
    })
    .eq('id', scriptId)
    .select()
    .single()

  if (error) {
    console.error('Error verifying script:', error)
    throw error
  }

  return data
}

/**
 * Create a new version of a script
 */
export async function createScriptVersion(
  parentScriptId: string,
  content: string,
  updates?: Partial<Omit<Script, 'id' | 'created_at' | 'updated_at'>>
): Promise<Script> {
  const supabase = createClient()

  // Get parent script to copy metadata
  const parent = await getScriptById(parentScriptId)
  if (!parent) {
    throw new Error('Parent script not found')
  }

  // Create new version
  const { data, error } = await supabase
    .from('scripts')
    .insert({
      topic_id: parent.topic_id,
      project_id: parent.project_id,
      content,
      hook: updates?.hook || parent.hook,
      reading_time: updates?.reading_time || parent.reading_time,
      delivery_notes: updates?.delivery_notes || parent.delivery_notes,
      visual_cues: updates?.visual_cues || parent.visual_cues,
      verification_status: 'pending', // New versions need re-verification
      version: parent.version + 1,
      parent_script_id: parentScriptId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating script version:', error)
    throw error
  }

  return data
}
