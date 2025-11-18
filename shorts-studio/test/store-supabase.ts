import { create } from 'zustand'
import { supabase, UserProfile, Project, Topic, Script, BatchPlan, CustomEvent } from './supabase'

// ============================================
// ZUSTAND STORE WITH SUPABASE
// ============================================

interface AppState {
  // User & Profile
  activeProfileId: string | null
  userProfile: UserProfile | null
  userProfiles: UserProfile[]
  
  // Projects
  projects: Project[]
  activeProjectId: string | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Profile Actions
  loadProfiles: () => Promise<void>
  setActiveProfile: (profileId: string) => Promise<void>
  addUserProfile: (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<UserProfile | null>
  updateUserProfile: (profileId: string, updates: Partial<UserProfile>) => Promise<void>
  deleteUserProfile: (profileId: string) => Promise<void>
  
  // Project Actions
  loadProjects: (profileId?: string) => Promise<void>
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project | null>
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  setActiveProject: (projectId: string) => void
  getProject: (projectId: string) => Promise<Project | null>
  
  // Topic Actions
  addTopicsToProject: (projectId: string, topics: Omit<Topic, 'id' | 'created_at' | 'updated_at' | 'project_id'>[]) => Promise<void>
  getTopicsForProject: (projectId: string) => Promise<Topic[]>
  updateTopic: (topicId: string, updates: Partial<Topic>) => Promise<void>
  
  // Script Actions
  addScriptsToProject: (projectId: string, scripts: Omit<Script, 'id' | 'created_at' | 'updated_at' | 'project_id'>[]) => Promise<void>
  getScriptsForProject: (projectId: string) => Promise<Script[]>
  getScript: (scriptId: string) => Promise<Script | null>
  updateScript: (scriptId: string, updates: Partial<Script>) => Promise<void>
  
  // Batch Plan Actions
  addBatchPlan: (batchPlan: Omit<BatchPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<BatchPlan | null>
  getBatchPlansForProject: (projectId: string) => Promise<BatchPlan[]>
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeProfileId: null,
  userProfile: null,
  userProfiles: [],
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  // ============================================
  // PROFILE ACTIONS
  // ============================================

  loadProfiles: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const profiles = data || []
      const activeProfile = profiles.find(p => p.is_active)

      set({
        userProfiles: profiles,
        userProfile: activeProfile || profiles[0] || null,
        activeProfileId: activeProfile?.id || profiles[0]?.id || null,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error loading profiles:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setActiveProfile: async (profileId: string) => {
    set({ isLoading: true, error: null })
    try {
      // Deactivate all profiles
      await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .neq('id', 'none') // Update all

      // Activate selected profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', profileId)

      if (error) throw error

      // Reload profiles
      await get().loadProfiles()
      
      // Load projects for this profile
      await get().loadProjects(profileId)
    } catch (error) {
      console.error('Error setting active profile:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addUserProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    try {
      // Deactivate all other profiles
      await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .neq('id', 'none')

      // Insert new profile as active
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ ...profileData, is_active: true }])
        .select()
        .single()

      if (error) throw error

      // Reload profiles
      await get().loadProfiles()
      
      set({ isLoading: false })
      return data
    } catch (error) {
      console.error('Error adding profile:', error)
      set({ error: (error as Error).message, isLoading: false })
      return null
    }
  },

  updateUserProfile: async (profileId, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profileId)

      if (error) throw error

      // Reload profiles
      await get().loadProfiles()
    } catch (error) {
      console.error('Error updating profile:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteUserProfile: async (profileId) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error

      // Reload profiles
      await get().loadProfiles()
    } catch (error) {
      console.error('Error deleting profile:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // ============================================
  // PROJECT ACTIONS
  // ============================================

  loadProjects: async (profileId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const activeId = profileId || get().activeProfileId
      if (!activeId) {
        set({ projects: [], isLoading: false })
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', activeId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ projects: data || [], isLoading: false })
    } catch (error) {
      console.error('Error loading projects:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addProject: async (projectData) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) throw error

      // Reload projects
      await get().loadProjects()
      
      set({ activeProjectId: data.id, isLoading: false })
      return data
    } catch (error) {
      console.error('Error adding project:', error)
      set({ error: (error as Error).message, isLoading: false })
      return null
    }
  },

  updateProject: async (projectId, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)

      if (error) throw error

      // Reload projects
      await get().loadProjects()
    } catch (error) {
      console.error('Error updating project:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      // Reload projects
      await get().loadProjects()
      
      if (get().activeProjectId === projectId) {
        set({ activeProjectId: null })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setActiveProject: (projectId) => {
    set({ activeProjectId: projectId })
  },

  getProject: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting project:', error)
      return null
    }
  },

  // ============================================
  // TOPIC ACTIONS
  // ============================================

  addTopicsToProject: async (projectId, topicsData) => {
    set({ isLoading: true, error: null })
    try {
      const topicsToInsert = topicsData.map((topic, index) => ({
        ...topic,
        project_id: projectId,
        order_index: index,
      }))

      const { error } = await supabase
        .from('topics')
        .insert(topicsToInsert)

      if (error) throw error

      set({ isLoading: false })
    } catch (error) {
      console.error('Error adding topics:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getTopicsForProject: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting topics:', error)
      return []
    }
  },

  updateTopic: async (topicId: string, updates) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', topicId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating topic:', error)
    }
  },

  // ============================================
  // SCRIPT ACTIONS
  // ============================================

  addScriptsToProject: async (projectId, scriptsData) => {
    set({ isLoading: true, error: null })
    try {
      const scriptsToInsert = scriptsData.map(script => ({
        ...script,
        project_id: projectId,
      }))

      const { error } = await supabase
        .from('scripts')
        .insert(scriptsToInsert)

      if (error) throw error

      set({ isLoading: false })
    } catch (error) {
      console.error('Error adding scripts:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getScriptsForProject: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting scripts:', error)
      return []
    }
  },

  getScript: async (scriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', scriptId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting script:', error)
      return null
    }
  },

  updateScript: async (scriptId: string, updates) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .update(updates)
        .eq('id', scriptId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating script:', error)
    }
  },

  // ============================================
  // BATCH PLAN ACTIONS
  // ============================================

  addBatchPlan: async (batchPlanData) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('batch_plans')
        .insert([batchPlanData])
        .select()
        .single()

      if (error) throw error

      set({ isLoading: false })
      return data
    } catch (error) {
      console.error('Error adding batch plan:', error)
      set({ error: (error as Error).message, isLoading: false })
      return null
    }
  },

  getBatchPlansForProject: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('batch_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting batch plans:', error)
      return []
    }
  },

  // ============================================
  // UTILITY ACTIONS
  // ============================================

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearAll: () => set({
    activeProfileId: null,
    userProfile: null,
    userProfiles: [],
    projects: [],
    activeProjectId: null,
    isLoading: false,
    error: null,
  }),
}))
