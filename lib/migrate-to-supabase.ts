'use client'

import { supabase } from '@/lib/supabase'

// ============================================
// LOCALSTORAGE TO SUPABASE MIGRATION
// ============================================

export interface MigrationResult {
  success: boolean
  profilesMigrated: number
  projectsMigrated: number
  topicsMigrated: number
  scriptsMigrated: number
  errors: string[]
}

export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  console.log('🚀 Starting migration from localStorage to Supabase...')
  
  const result: MigrationResult = {
    success: false,
    profilesMigrated: 0,
    projectsMigrated: 0,
    topicsMigrated: 0,
    scriptsMigrated: 0,
    errors: [],
  }

  try {
    // ============================================
    // STEP 1: Migrate User Profiles
    // ============================================
    console.log('📝 Step 1: Migrating user profiles...')
    
    const userProfileData = localStorage.getItem('userProfile')
    const userProfilesData = localStorage.getItem('shorts-studio-storage')
    
    let profilesToMigrate: any[] = []
    
    // Check old format (single profile)
    if (userProfileData) {
      const oldProfile = JSON.parse(userProfileData)
      profilesToMigrate.push({
        profile_name: oldProfile.profileName || oldProfile.channelName || 'My Profile',
        name: oldProfile.name || 'Creator',
        channel_name: oldProfile.channelName,
        niche: oldProfile.niche || 'Content Creator',
        unique_angle: oldProfile.uniqueAngle,
        location: oldProfile.location,
        country: oldProfile.country,
        primary_tone: oldProfile.primaryTone,
        secondary_tone: oldProfile.secondaryTone,
        accent_tone: oldProfile.accentTone,
        catchphrases: oldProfile.catchphrases || [],
        wont_cover: oldProfile.wontCover || [],
        privacy_limits: oldProfile.privacyLimits || [],
        is_active: true,
      })
    }
    
    // Check new format (Zustand store with multiple profiles)
    if (userProfilesData) {
      const storeData = JSON.parse(userProfilesData)
      if (storeData.state?.userProfiles && Array.isArray(storeData.state.userProfiles)) {
        const profiles = storeData.state.userProfiles.map((p: any) => ({
          profile_name: p.profileName,
          name: p.name,
          channel_name: p.channelName,
          niche: p.niche,
          unique_angle: p.uniqueAngle,
          location: p.location,
          country: p.country,
          primary_tone: p.primaryTone,
          secondary_tone: p.secondaryTone,
          accent_tone: p.accentTone,
          catchphrases: p.catchphrases || [],
          wont_cover: p.wontCover || [],
          privacy_limits: p.privacyLimits || [],
          is_active: p.id === storeData.state.activeProfileId,
        }))
        profilesToMigrate = [...profilesToMigrate, ...profiles]
      }
    }

    // Remove duplicates by profile_name
    const uniqueProfiles = Array.from(
      new Map(profilesToMigrate.map(p => [p.profile_name, p])).values()
    )

    if (uniqueProfiles.length > 0) {
      const { data: insertedProfiles, error: profileError } = await supabase
        .from('user_profiles')
        .insert(uniqueProfiles)
        .select()

      if (profileError) {
        result.errors.push(`Profile migration error: ${profileError.message}`)
        console.error('❌ Profile migration error:', profileError)
      } else {
        result.profilesMigrated = insertedProfiles?.length || 0
        console.log(`✅ Migrated ${result.profilesMigrated} profiles`)

        // ============================================
        // STEP 2: Migrate Projects
        // ============================================
        console.log('📝 Step 2: Migrating projects...')
        
        const activeProfile = insertedProfiles?.find(p => p.is_active) || insertedProfiles?.[0]
        
        if (activeProfile) {
          const projectsData = localStorage.getItem('projects')
          
          if (projectsData) {
            const oldProjects = JSON.parse(projectsData)
            
            for (const oldProject of oldProjects) {
              try {
                // Convert month to proper date format (YYYY-MM-DD)
                let monthDate = oldProject.month
                if (monthDate && !monthDate.includes('-01')) {
                  // If format is "2025-12", convert to "2025-12-01"
                  monthDate = monthDate.length === 7 ? `${monthDate}-01` : monthDate
                }

                // Insert project
                const { data: newProject, error: projectError } = await supabase
                  .from('projects')
                  .insert([{
                    profile_id: activeProfile.id,
                    name: oldProject.name,
                    month: monthDate,
                    videos_needed: oldProject.videosNeeded || 30,
                    production_mode: oldProject.productionMode || 'traditional',
                    tone_mix: oldProject.toneMix || {
                      emotional: 20,
                      calming: 20,
                      storytelling: 20,
                      educational: 20,
                      humor: 20,
                    },
                    status: oldProject.status || 'planning',
                  }])
                  .select()
                  .single()

                if (projectError) {
                  result.errors.push(`Project "${oldProject.name}" error: ${projectError.message}`)
                  continue
                }

                result.projectsMigrated++
                console.log(`✅ Migrated project: ${oldProject.name}`)

                // ============================================
                // STEP 3: Migrate Topics for this project
                // ============================================
                if (oldProject.topics && oldProject.topics.length > 0) {
                  const topicsToInsert = oldProject.topics.map((topic: any, index: number) => ({
                    project_id: newProject.id,
                    title: topic.title,
                    hook: topic.hook,
                    core_value: topic.coreValue,
                    emotional_driver: topic.emotionalDriver,
                    format_type: topic.formatType,
                    tone: topic.tone,
                    longevity: topic.longevity,
                    date_range_start: topic.dateRangeStart,
                    date_range_end: topic.dateRangeEnd,
                    fact_check_status: topic.factCheckStatus || 'needs_review',
                    production_notes: topic.productionNotes,
                    order_index: topic.orderIndex || index,
                  }))

                  const { data: insertedTopics, error: topicsError } = await supabase
                    .from('topics')
                    .insert(topicsToInsert)
                    .select()

                  if (topicsError) {
                    result.errors.push(`Topics for "${oldProject.name}" error: ${topicsError.message}`)
                  } else {
                    result.topicsMigrated += insertedTopics?.length || 0
                    console.log(`✅ Migrated ${insertedTopics?.length} topics for ${oldProject.name}`)

                    // ============================================
                    // STEP 4: Migrate Scripts for this project
                    // ============================================
                    if (oldProject.scripts && oldProject.scripts.length > 0) {
                      const scriptsToInsert = oldProject.scripts.map((script: any) => {
                        // Find matching topic
                        const matchingTopic = insertedTopics?.find(
                          t => t.title === oldProject.topics.find((ot: any) => ot.id === script.topicId)?.title
                        )

                        return {
                          project_id: newProject.id,
                          topic_id: matchingTopic?.id || insertedTopics?.[0]?.id,
                          content: script.content || script.fullScript,
                          hook: script.hook,
                          reading_time: script.readingTime,
                          delivery_notes: script.deliveryNotes || {},
                          visual_cues: script.visualCues || {},
                          fact_check_notes: script.factCheckNotes || {},
                          verification_status: script.verificationStatus || 'needs_review',
                          verified_at: script.verifiedAt,
                          version: script.version || 1,
                          production_mode: script.productionMode,
                        }
                      })

                      const { data: insertedScripts, error: scriptsError } = await supabase
                        .from('scripts')
                        .insert(scriptsToInsert)
                        .select()

                      if (scriptsError) {
                        result.errors.push(`Scripts for "${oldProject.name}" error: ${scriptsError.message}`)
                      } else {
                        result.scriptsMigrated += insertedScripts?.length || 0
                        console.log(`✅ Migrated ${insertedScripts?.length} scripts for ${oldProject.name}`)
                      }
                    }
                  }
                }
              } catch (error) {
                result.errors.push(`Error migrating project "${oldProject.name}": ${(error as Error).message}`)
                console.error(`❌ Error migrating project:`, error)
              }
            }
          }
        }
      }
    }

    // ============================================
    // MIGRATION COMPLETE
    // ============================================
    result.success = result.errors.length === 0
    
    console.log('\n🎉 Migration Complete!')
    console.log(`✅ Profiles migrated: ${result.profilesMigrated}`)
    console.log(`✅ Projects migrated: ${result.projectsMigrated}`)
    console.log(`✅ Topics migrated: ${result.topicsMigrated}`)
    console.log(`✅ Scripts migrated: ${result.scriptsMigrated}`)
    
    if (result.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${result.errors.length}`)
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    return result

  } catch (error) {
    console.error('❌ Migration failed:', error)
    result.errors.push((error as Error).message)
    return result
  }
}

// ============================================
// BACKUP LOCALSTORAGE DATA
// ============================================

export function backupLocalStorage(): string {
  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      userProfile: localStorage.getItem('userProfile'),
      projects: localStorage.getItem('projects'),
      shortsStudioStorage: localStorage.getItem('shorts-studio-storage'),
    },
  }
  
  const backupJson = JSON.stringify(backup, null, 2)
  
  // Download backup file
  const blob = new Blob([backupJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shorts-studio-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  console.log('✅ Backup created and downloaded')
  return backupJson
}

// ============================================
// CLEAR LOCALSTORAGE (AFTER SUCCESSFUL MIGRATION)
// ============================================

export function clearLocalStorageAfterMigration() {
  const itemsToRemove = [
    'userProfile',
    'projects',
    'shorts-studio-storage',
    'selectedTopicIndices',
    'selectedScriptIndices',
    'productionMode',
  ]
  
  itemsToRemove.forEach(item => {
    localStorage.removeItem(item)
    console.log(`🗑️  Removed: ${item}`)
  })
  
  console.log('✅ localStorage cleared')
}