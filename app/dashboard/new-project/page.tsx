'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { createClient } from '@/lib/supabase/client'

// Localization dictionary (kept the same)
const getLocalizedToneLabel = (tone: string, language: string) => {
  const isBritish = language?.includes('British') || language?.includes('UK')
  const labels: Record<string, { british: string; american: string }> = {
    emotional: { british: 'Emotional', american: 'Emotional' },
    calming: { british: 'Calming', american: 'Calming' },
    storytelling: { british: 'Storytelling', american: 'Storytelling' },
    educational: { british: 'Educational', american: 'Educational' },
    humor: { british: 'Humour', american: 'Humor' },
    humour: { british: 'Humour', american: 'Humor' },
    inspirational: { british: 'Inspirational', american: 'Inspirational' },
    motivational: { british: 'Motivational', american: 'Motivational' },
    conversational: { british: 'Conversational', american: 'Conversational' },
  }
  const toneLower = tone.toLowerCase()
  if (labels[toneLower]) return isBritish ? labels[toneLower].british : labels[toneLower].american
  return tone.charAt(0).toUpperCase() + tone.slice(1)
}

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [generatedTopics, setGeneratedTopics] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [regional, setRegional] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [projectName, setProjectName] = useState('')
  const [month, setMonth] = useState('')
  const [videosPerDay, setVideosPerDay] = useState(1)
  const [bufferVideos, setBufferVideos] = useState(3)
  const [productionMode, setProductionMode] = useState<'traditional' | 'ai-voice' | 'fully-ai'>('traditional')
  const [toneMix, setToneMix] = useState({
    emotional: 30,
    calming: 25,
    storytelling: 20,
    educational: 15,
    humor: 10,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (!profileData) {
          setError('User profile not found.')
          setLoading(false)
          return
        }

        const mappedProfile = {
            ...profileData,
            uniqueAngle: profileData.unique_angle,
            languageVariant: profileData.language_variant,
            targetAudience: profileData.target_audience,
            signatureTone: profileData.signature_tone || { primary: 'storytelling', secondary: 'educational', accent: 'humor' },
            wontCover: profileData.wont_cover || [],
            catchphrases: profileData.catchphrases || [],
            country: profileData.country || 'United Kingdom'
        }
        setProfile(mappedProfile)
        
        const language = mappedProfile.languageVariant || 
                         (mappedProfile.targetAudience === 'United Kingdom' ? 'British English' : 
                          mappedProfile.country === 'United Kingdom' ? 'British English' : 'American English')
        
        const defaultRegional = {
          location: mappedProfile.targetAudience || mappedProfile.country || 'United Kingdom',
          countryCode: mappedProfile.country === 'United Kingdom' ? 'GB' : 'US',
          hemisphere: 'Northern',
          timezone: mappedProfile.country === 'United Kingdom' ? 'Europe/London' : 'America/New_York',
          language: language,
          holidays: []
        }
        setRegional(defaultRegional)
        setLoading(false)

      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load profile data. Please try refreshing.')
        setLoading(false)
      }
    }
    loadData()
  }, [router, supabase])

  const daysInMonth = month ? new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate() : 30
  const totalVideos = (daysInMonth * videosPerDay) + bufferVideos

  const handleGenerateTopics = async () => {
    if (!profile || !regional) { setError('Profile or regional settings not loaded'); return; }
    if (!projectName || !month) { setError('Please fill in project name and month'); return; }

    setGenerating(true)
    setError(null)
    setProgress('Connecting to AI...')
    setGeneratedTopics([])

    try {
      const requestBody = {
        projectName,
        month,
        videosNeeded: totalVideos,
        toneMix,
        profile: {
          niche: profile.niche || '',
          uniqueAngle: profile.uniqueAngle || '',
          signatureTone: profile.signatureTone,
          wontCover: profile.wontCover,
          catchphrases: profile.catchphrases,
          targetAudience: profile.targetAudience,
          languageVariant: profile.languageVariant
        },
        regional,
        productionMode
      }

      let endpoint = '/api/topics/generate-stream'
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.status === 404) {
        endpoint = '/api/topics/generate'
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate topics' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''
        let finalTopics: any[] = []
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'progress') setProgress(data.message)
                else if (data.type === 'topic') {
                    setGeneratedTopics(prev => [...prev, data.topic])
                    finalTopics.push(data.topic)
                }
                else if (data.type === 'complete') {
                    await saveProjectToSupabase(data.topics || finalTopics)
                }
                else if (data.type === 'error') throw new Error(data.error)
              } catch (e) { console.error('Parse error', e) }
            }
          }
        }
      } else {
        const data = await response.json()
        if (data.topics && Array.isArray(data.topics)) {
            setGeneratedTopics(data.topics)
            await saveProjectToSupabase(data.topics)
        } else {
            throw new Error('Invalid response format')
        }
      }
      
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate topics')
      setProgress('')
      setGenerating(false)
    }
  }

  const saveProjectToSupabase = async (topics: any[]) => {
    setProgress('Saving to database...')
    console.log('💾 Saving', topics.length, 'topics...')

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // 1. Insert Project
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
                profile_id: user.id,
                name: projectName,
                month: `${month}-01`, 
                videos_needed: totalVideos,
                production_mode: productionMode,
                tone_mix: toneMix
            })
            .select()
            .single()

        if (projectError) {
            console.error('❌ Project Save Error:', projectError)
            throw new Error(`Failed to save project: ${projectError.message}`)
        }

        // 2. Insert Topics - WITH ROBUST DEFAULTS
        // This protects against "null" errors if AI misses a field
        const topicsToInsert = topics.map((t: any) => ({
            project_id: projectData.id,
            title: t.title || 'Untitled Topic',
            hook: t.hook || '',
            core_value: t.coreValue || t.core_value || '', 
            emotional_driver: t.emotionalDriver || t.emotional_driver || ''
        }))

        const { error: topicsError } = await supabase
            .from('topics')
            .insert(topicsToInsert)

        if (topicsError) {
            console.error('❌ Topics Save Error:', topicsError)
            throw new Error(`Failed to save topics: ${topicsError.message} (Hint: Check column names in Supabase)`)
        }

        console.log('✅ Saved to Supabase')
        setProgress('Success! Redirecting...')
        setTimeout(() => router.push('/dashboard'), 1500)

    } catch (saveError: any) {
        console.error('❌ Critical Save Error:', saveError)
        setError(saveError.message || 'Generated topics but failed to save to database.')
        setGenerating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 py-8 text-center">Loading profile...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">Plan your content for the month with AI-generated topics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {progress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {progress}
          </div>
        )}

        {generatedTopics.length > 0 && (
           <div className="bg-green-50 border border-green-200 rounded mb-6 p-4">
             <h3 className="font-semibold text-green-900 mb-2">
               ✅ Generated {generatedTopics.length} Topics
             </h3>
             <div className="text-sm text-green-700 space-y-1 max-h-48 overflow-y-auto">
               {generatedTopics.slice(0, 5).map((topic, i) => (
                 <div key={i}>• {topic.title}</div>
               ))}
               {generatedTopics.length > 5 && <div className="text-green-600">...and {generatedTopics.length - 5} more</div>}
             </div>
           </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Project Basics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Project Basics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., December 2025" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" disabled={generating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" disabled={generating} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Videos per Day</label>
                  <select value={videosPerDay} onChange={(e) => setVideosPerDay(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={generating}>
                    <option value={1}>1 per day</option>
                    <option value={2}>2 per day</option>
                    <option value={3}>3 per day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Videos</label>
                  <input type="number" value={bufferVideos} onChange={(e) => setBufferVideos(Number(e.target.value))} min={0} max={10} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={generating} />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900 font-medium">Total videos needed: <span className="font-bold">{totalVideos}</span></p>
                <p className="text-xs text-blue-700 mt-1">({daysInMonth} days × {videosPerDay} {videosPerDay === 1 ? 'video' : 'videos'} + {bufferVideos} buffer)</p>
              </div>
            </div>
          </div>

          {/* Production Mode */}
          <div>
            <h2 className="text-xl font-semibold mb-4">2. Production Mode</h2>
            <div className="space-y-3">
              {['traditional', 'ai-voice', 'fully-ai'].map((mode) => (
                <label key={mode} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="productionMode" value={mode} checked={productionMode === mode} onChange={(e) => setProductionMode(e.target.value as any)} className="mt-1" disabled={generating} />
                  <div>
                    <div className="font-medium">{mode === 'traditional' ? 'Traditional Filming' : mode === 'ai-voice' ? 'AI Voice + Stock Footage' : 'Fully AI-Generated'}</div>
                    <div className="text-sm text-gray-600">
                      {mode === 'traditional' ? 'You film yourself speaking directly to camera' : mode === 'ai-voice' ? 'AI voiceover with stock footage and B-roll' : 'AI-generated video, voice, and visuals'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tone Mix */}
          <div>
            <h2 className="text-xl font-semibold mb-4">3. Tone Mix</h2>
            <div className="space-y-4">
              {Object.entries(toneMix).map(([tone, value]) => (
                <div key={tone}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">{getLocalizedToneLabel(tone, regional?.language || profile?.languageVariant || '')}</label>
                    <span className="text-sm text-gray-600">{value}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={value} onChange={(e) => setToneMix({ ...toneMix, [tone]: Number(e.target.value) })} className="w-full" disabled={generating} />
                </div>
              ))}
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                Total: {Object.values(toneMix).reduce((a, b) => a + b, 0)}%
                {Object.values(toneMix).reduce((a, b) => a + b, 0) !== 100 && <span className="text-amber-600 ml-2">(Note: Should total 100% for best results)</span>}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t">
            <button onClick={handleGenerateTopics} disabled={generating || !projectName || !month} className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${generating || !projectName || !month ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {generating ? 'Generating Topics...' : 'Generate Topics with AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}