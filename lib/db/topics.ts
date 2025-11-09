import { createClient } from '@/lib/supabase/client'

export interface Topic {
  id: string
  project_id: string
  title: string
  hook: string | null
  core_value: string | null
  emotional_driver: string | null
  format_type: string | null
  tone: string | null
  longevity: 'evergreen' | 'seasonal' | 'trending' | null
  date_range_start: string | null
  date_range_end: string | null
  fact_check_status: 'verified' | 'needs_review' | 'opinion'
  fact_check_notes: string | null
  verified_at: string | null
  verified_by: string | null
  review_date: string | null
  order_index: number | null
  created_at: string
  updated_at: string
}

/**
 * Get all topics for a project
 */
export async function getTopicsByProjectId(projectId: string): Promise<Topic[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific topic by ID
 */
export async function getTopicById(topicId: string): Promise<Topic | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()

  if (error) {
    console.error('Error fetching topic:', error)
    return null
  }

  return data
}

/**
 * Create topics in bulk (from AI generation)
 */
export async function createTopics(
  projectId: string,
  topics: Array<{
    title: string
    hook?: string
    core_value?: string
    emotional_driver?: string
    format_type?: string
    tone?: string
    longevity?: 'evergreen' | 'seasonal' | 'trending'
    date_range_start?: string
    date_range_end?: string
    fact_check_status?: 'verified' | 'needs_review' | 'opinion'
    order_index?: number
  }>
): Promise<Topic[]> {
  const supabase = createClient()

  const topicsWithProjectId = topics.map(topic => ({
    project_id: projectId,
    ...topic,
  }))

  const { data, error } = await supabase
    .from('topics')
    .insert(topicsWithProjectId)
    .select()

  if (error) {
    console.error('Error creating topics:', error)
    throw error
  }

  return data
}

/**
 * Update a topic
 */
export async function updateTopic(
  topicId: string,
  updates: Partial<Omit<Topic, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<Topic> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', topicId)
    .select()
    .single()

  if (error) {
    console.error('Error updating topic:', error)
    throw error
  }

  return data
}

/**
 * Delete a topic
 */
export async function deleteTopic(topicId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)

  if (error) {
    console.error('Error deleting topic:', error)
    throw error
  }
}

/**
 * Mark topic as verified
 */
export async function verifyTopic(
  topicId: string,
  userId: string,
  notes?: string
): Promise<Topic> {
  const supabase = createClient()

  const verifiedAt = new Date().toISOString()
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 60) // 60 days from now

  const { data, error } = await supabase
    .from('topics')
    .update({
      fact_check_status: 'verified',
      fact_check_notes: notes || null,
      verified_at: verifiedAt,
      verified_by: userId,
      review_date: reviewDate.toISOString().split('T')[0], // YYYY-MM-DD format
    })
    .eq('id', topicId)
    .select()
    .single()

  if (error) {
    console.error('Error verifying topic:', error)
    throw error
  }

  return data
}
