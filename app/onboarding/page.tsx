'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OnboardingStep = 'profile' | 'location' | 'audience' | 'style' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile')
  const [formData, setFormData] = useState({
    profileName: '',
    name: '',
    channelName: '',
    niche: '',
    uniqueAngle: '',
    // Creator Location
    location: '',
    country: 'United Kingdom',
    customCountry: '',
    // Target Audience (NEW!)
    targetAudience: 'United Kingdom',
    customTargetAudience: '',
    languageVariant: 'British English',
    // Style
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

  const steps: OnboardingStep[] = ['profile', 'location', 'audience', 'style', 'complete']
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
      targetAudience: formData.targetAudience === 'Other' ? formData.customTargetAudience : formData.targetAudience,
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

  // Auto-set language variant based on target audience
  const handleTargetAudienceChange = (value: string) => {
    updateFormData('targetAudience', value)
    
    // Auto-suggest language variant based on target
    if (value === 'United Kingdom' || value === 'Ireland' || value === 'Australia' || value === 'New Zealand') {
      updateFormData('languageVariant', 'British English')
    } else if (value === 'United States' || value === 'Canada') {
      updateFormData('languageVariant', 'American English')
    } else if (value === 'Global/International') {
      // Keep current selection or default
      updateFormData('languageVariant', formData.languageVariant || 'British English')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Profile</span>
            <span>Location</span>
            <span>Audience</span>
            <span>Style</span>
            <span>Done</span>
          </div>
        </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sarah Mitchell"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={formData.channelName}
                    onChange={(e) => updateFormData('channelName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Faith in Real Life"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Niche</label>
                  <input
                    type="text"
                    value={formData.niche}
                    onChange={(e) => updateFormData('niche', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Christian poetry and faith-based apparel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Unique Angle</label>
                  <textarea
                    value={formData.uniqueAngle}
                    onChange={(e) => updateFormData('uniqueAngle', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What makes your approach different?"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'location' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Where are you located?</h2>
              <p className="text-gray-600 mb-8">This is YOUR physical location (not your audience)</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your country"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="London"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NEW STEP: Target Audience */}
          {currentStep === 'audience' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Who's your target audience?</h2>
              <p className="text-gray-600 mb-8">This determines language style and cultural references in your content</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Why this matters</p>
                    <p className="text-sm text-blue-700">
                      If you're in the UK but targeting US viewers, we'll use American English (color, humor).
                      If you're targeting UK viewers, we'll use British English (colour, humour).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleTargetAudienceChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                    <option value="Ireland">🇮🇪 Ireland</option>
                    <option value="Global/International">🌍 Global/International</option>
                    <option value="Other">Other (specify below)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    This is who you're creating content FOR, which may differ from where you're located
                  </p>
                </div>

                {formData.targetAudience === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specify Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.customTargetAudience}
                      onChange={(e) => updateFormData('customTargetAudience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., South Africa, India, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Variant
                  </label>
                  <select
                    value={formData.languageVariant}
                    onChange={(e) => updateFormData('languageVariant', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="British English">🇬🇧 British English (colour, humour, favourite)</option>
                    <option value="American English">🇺🇸 American English (color, humor, favorite)</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Auto-selected based on target audience, but you can change it if needed
                  </p>
                </div>

                {/* Examples based on selection */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {formData.languageVariant === 'British English' ? '🇬🇧 British English Examples:' : '🇺🇸 American English Examples:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    {formData.languageVariant === 'British English' ? (
                      <>
                        <div>✅ colour</div>
                        <div>✅ favourite</div>
                        <div>✅ organised</div>
                        <div>✅ humour</div>
                        <div>✅ trousers</div>
                        <div>✅ mobile phone</div>
                        <div>✅ holiday</div>
                        <div>✅ queue</div>
                      </>
                    ) : (
                      <>
                        <div>✅ color</div>
                        <div>✅ favorite</div>
                        <div>✅ organized</div>
                        <div>✅ humor</div>
                        <div>✅ pants</div>
                        <div>✅ cell phone</div>
                        <div>✅ vacation</div>
                        <div>✅ line</div>
                      </>
                    )}
                  </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Contemplative, Dramatic, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Tone (25%)</label>
                  <select
                    value={formData.secondaryTone}
                    onChange={(e) => updateFormData('secondaryTone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Energetic, Soothing, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Tone (15%)</label>
                  <select
                    value={formData.accentTone}
                    onChange={(e) => updateFormData('accentTone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Humour">Humour</option>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Whimsical, Mysterious, etc."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h2>
              <p className="text-xl text-gray-600 mb-4">Your profile is ready. Let's start creating!</p>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Profile Summary:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  <p><span className="font-medium">Channel:</span> {formData.channelName}</p>
                  <p><span className="font-medium">Niche:</span> {formData.niche}</p>
                  <p><span className="font-medium">Your Location:</span> {formData.location}, {formData.country}</p>
                  <p><span className="font-medium">Target Audience:</span> {formData.targetAudience}</p>
                  <p><span className="font-medium">Language:</span> {formData.languageVariant}</p>
                  <p><span className="font-medium">Tone:</span> {formData.primaryTone}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStepIndex > 0 && currentStep !== 'complete' && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back
              </button>
            )}
            {currentStep !== 'complete' && (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Next →
              </button>
            )}
            {currentStep === 'complete' && (
              <button
                onClick={handleComplete}
                className="mx-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
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
