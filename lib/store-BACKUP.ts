import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface UserProfile {
  id: string
  profileName: string
  name: string
  channelName: string
  niche: string
  uniqueAngle: string
  location: string
  country: string
  primaryTone: string
  secondaryTone: string
  accentTone: string
  catchphrases: string[]
  wontCover: string[]
  privacyLimits: string[]
  createdAt: string
}

export interface Topic {
  id: string
  title: string
  hook: string
  coreValue: string
  emotionalDriver: string
  formatType: string
  tone: string
  longevity: string
  dateRangeStart: string
  dateRangeEnd: string
  factCheckStatus: string
  orderIndex: number
  createdAt: string
}

export interface Script {
  id: string
  topicId: string
  content: string
  hook: string
  readingTime: number
  deliveryNotes?: any
  visualCues?: any
  factCheckNotes?: any
  verificationStatus: string
  verifiedAt?: string
  version: number
  createdAt: string
}

export interface Project {
  id: string
  name: string
  month: string
  videosNeeded: number
  toneMix: Record<string, number>
  topics?: Topic[]
  scripts?: Script[]
  status: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
  createdAt: string
  updatedAt: string
}

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
  
  // Actions
  setActiveProfile: (profileId: string) => void
  setUserProfile: (profile: UserProfile) => void
  addUserProfile: (profile: UserProfile) => void
  updateUserProfile: (profileId: string, updates: Partial<UserProfile>) => void
  deleteUserProfile: (profileId: string) => void
  
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  setActiveProject: (projectId: string) => void
  
  addTopicsToProject: (projectId: string, topics: Topic[]) => void
  addScriptsToProject: (projectId: string, scripts: Script[]) => void
  
  setLoading: (loading: boolean) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeProfileId: null,
      userProfile: null,
      userProfiles: [],
      projects: [],
      activeProjectId: null,
      isLoading: false,

      // Profile actions
      setActiveProfile: (profileId) => {
        const profile = get().userProfiles.find(p => p.id === profileId)
        set({ 
          activeProfileId: profileId,
          userProfile: profile || null 
        })
      },

      setUserProfile: (profile) => {
        set({ 
          userProfile: profile,
          activeProfileId: profile.id 
        })
      },

      addUserProfile: (profile) => {
        set((state) => ({
          userProfiles: [...state.userProfiles, profile],
          userProfile: profile,
          activeProfileId: profile.id,
        }))
      },

      updateUserProfile: (profileId, updates) => {
        set((state) => ({
          userProfiles: state.userProfiles.map(p =>
            p.id === profileId ? { ...p, ...updates } : p
          ),
          userProfile: state.activeProfileId === profileId 
            ? { ...state.userProfile!, ...updates }
            : state.userProfile
        }))
      },

      deleteUserProfile: (profileId) => {
        set((state) => {
          const newProfiles = state.userProfiles.filter(p => p.id !== profileId)
          return {
            userProfiles: newProfiles,
            userProfile: state.activeProfileId === profileId ? null : state.userProfile,
            activeProfileId: state.activeProfileId === profileId ? null : state.activeProfileId,
          }
        })
      },

      // Project actions
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
        }))
      },

      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId 
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
        }))
      },

      setActiveProject: (projectId) => {
        set({ activeProjectId: projectId })
      },

      addTopicsToProject: (projectId, topics) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, topics, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      addScriptsToProject: (projectId, scripts) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, scripts, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),

      clearAll: () => set({
        activeProfileId: null,
        userProfile: null,
        userProfiles: [],
        projects: [],
        activeProjectId: null,
        isLoading: false,
      }),
    }),
    {
      name: 'shorts-studio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
