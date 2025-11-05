'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OnboardingStep = 'profile' | 'location' | 'style' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile')
  const [formData, setFormData] = useState({
  profileName: '',
  name: '',
  channelName: '',
  niche: '',
  uniqueAngle: '',
  location: '',
  country: 'United Kingdom',
  customCountry: '',
  primaryTone: '',
  customPrimaryTone: '',
  secondaryTone: '',
  customSecondaryTone: '',
  accentTone: '',
  customAccentTone: '',
  catchphrases: [''],
  wontCover: [''],
  privacyLimits: ['']
})

  const steps: OnboardingStep[] = ['profile', 'location', 'style', 'complete']
  const currentStepIndex = steps.indexOf(currentStep)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

 const handleComplete = () => {
  const profileId = Date.now().toString()
  
  // Use custom values if "Other" was selected
  const finalFormData = {
    ...formData,
    country: formData.country === 'Other' ? formData.customCountry : formData.country,
    primaryTone: formData.primaryTone === 'Other' ? formData.customPrimaryTone : formData.primaryTone,
    secondaryTone: formData.secondaryTone === 'Other' ? formData.customSecondaryTone : formData.secondaryTone,
    accentTone: formData.accentTone === 'Other' ? formData.customAccentTone : formData.accentTone,
  }
  
  const newProfile = {
    ...finalFormData,
    id: profileId,
    createdAt: new Date().toISOString()
  }
  
  // Save to profiles array
  const existingProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]')
  existingProfiles.push(newProfile)
  localStorage.setItem('userProfiles', JSON.stringify(existingProfiles))
  
  // Set as active profile
  localStorage.setItem('activeProfileId', profileId)
  localStorage.setItem('userProfile', JSON.stringify(newProfile))
  
  router.push('/dashboard')
}

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 'profile' && (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h2>
    <p className="text-gray-600 mb-8">Tell us about you and your channel</p>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Name <span className="text-gray-500">(e.g., "Christian Poetry" or "Tech Tutorials")</span>
        </label>
        <input
          type="text"
          value={formData.profileName}
          onChange={(e) => updateFormData('profileName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="My Christian Poetry Channel"
        />
        <p className="mt-1 text-xs text-gray-500">This helps you identify different content themes</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Sarah Mitchell"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
        <input
          type="text"
          value={formData.channelName}
          onChange={(e) => updateFormData('channelName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Faith in Real Life"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Niche</label>
        <input
          type="text"
          value={formData.niche}
          onChange={(e) => updateFormData('niche', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Christian poetry and faith-based apparel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Unique Angle</label>
        <textarea
          value={formData.uniqueAngle}
          onChange={(e) => updateFormData('uniqueAngle', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="What makes your approach different?"
        />
      </div>
    </div>
  </div>
)}

          {currentStep === 'location' && (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Where are you?</h2>
    <p className="text-gray-600 mb-8">This helps us customize content</p>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
        <select
          value={formData.country}
          onChange={(e) => updateFormData('country', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="United Kingdom">United Kingdom</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
          <option value="Ireland">Ireland</option>
          <option value="South Africa">South Africa</option>
          <option value="India">India</option>
          <option value="Singapore">Singapore</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Spain">Spain</option>
          <option value="Italy">Italy</option>
          <option value="Netherlands">Netherlands</option>
          <option value="Brazil">Brazil</option>
          <option value="Mexico">Mexico</option>
          <option value="Argentina">Argentina</option>
          <option value="Japan">Japan</option>
          <option value="South Korea">South Korea</option>
          <option value="Philippines">Philippines</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Kenya">Kenya</option>
          <option value="Other">Other (specify below)</option>
        </select>
      </div>

      {formData.country === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specify Country
          </label>
          <input
            type="text"
            value={formData.customCountry}
            onChange={(e) => updateFormData('customCountry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Enter your country"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData('location', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="London"
        />
      </div>
    </div>
  </div>
)}

          {currentStep === 'style' && (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your style?</h2>
    <p className="text-gray-600 mb-8">Help us capture your voice</p>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Tone (60%)</label>
        <select
          value={formData.primaryTone}
          onChange={(e) => updateFormData('primaryTone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="">Select...</option>
          <option value="Storytelling">Storytelling</option>
          <option value="Educational">Educational</option>
          <option value="Inspirational">Inspirational</option>
          <option value="Motivational">Motivational</option>
          <option value="Conversational">Conversational</option>
          <option value="Professional">Professional</option>
          <option value="Poetic">Poetic</option>
          <option value="Reflective">Reflective</option>
          <option value="Uplifting">Uplifting</option>
          <option value="Authentic">Authentic</option>
          <option value="Other">Other (specify below)</option>
        </select>
      </div>

      {formData.primaryTone === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specify Primary Tone
          </label>
          <input
            type="text"
            value={formData.customPrimaryTone}
            onChange={(e) => updateFormData('customPrimaryTone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="e.g., Contemplative, Dramatic, etc."
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Tone (25%)</label>
        <select
          value={formData.secondaryTone}
          onChange={(e) => updateFormData('secondaryTone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="">Select...</option>
          <option value="Emotional">Emotional/Vulnerable</option>
          <option value="Calming">Calming</option>
          <option value="Educational">Educational</option>
          <option value="Encouraging">Encouraging</option>
          <option value="Thoughtful">Thoughtful</option>
          <option value="Warm">Warm</option>
          <option value="Gentle">Gentle</option>
          <option value="Direct">Direct</option>
          <option value="Compassionate">Compassionate</option>
          <option value="Other">Other (specify below)</option>
        </select>
      </div>

      {formData.secondaryTone === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specify Secondary Tone
          </label>
          <input
            type="text"
            value={formData.customSecondaryTone}
            onChange={(e) => updateFormData('customSecondaryTone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="e.g., Energetic, Soothing, etc."
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Tone (15%)</label>
        <select
          value={formData.accentTone}
          onChange={(e) => updateFormData('accentTone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="">Select...</option>
          <option value="Humor">Humor</option>
          <option value="Inspirational">Inspirational</option>
          <option value="Creative">Creative</option>
          <option value="Artistic">Artistic</option>
          <option value="Playful">Playful</option>
          <option value="Bold">Bold</option>
          <option value="Challenging">Challenging</option>
          <option value="Hopeful">Hopeful</option>
          <option value="Other">Other (specify below)</option>
        </select>
      </div>

      {formData.accentTone === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specify Accent Tone
          </label>
          <input
            type="text"
            value={formData.customAccentTone}
            onChange={(e) => updateFormData('customAccentTone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="e.g., Whimsical, Mysterious, etc."
          />
        </div>
      )}
    </div>
  </div>
)}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h2>
              <p className="text-xl text-gray-600 mb-8">Your profile is ready. Let's start creating!</p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStepIndex > 0 && currentStep !== 'complete' && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-700 hover:text-gray-900"
              >
                ← Back
              </button>
            )}
            {currentStep !== 'complete' && (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Next →
              </button>
            )}
            {currentStep === 'complete' && (
              <button
                onClick={handleComplete}
                className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Go to Dashboard →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}