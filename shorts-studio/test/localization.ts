/**
 * Localization Utility for British vs American English
 * 
 * This utility provides consistent British/American English support across your app.
 * Use this for all UI labels that differ between UK and US English.
 */

// Localization dictionary
const LOCALIZATION_DICTIONARY: Record<string, { british: string; american: string }> = {
  // Tone labels
  'humor': { british: 'Humour', american: 'Humor' },
  'humour': { british: 'Humour', american: 'Humor' },
  'emotional': { british: 'Emotional', american: 'Emotional' },
  'calming': { british: 'Calming', american: 'Calming' },
  'storytelling': { british: 'Storytelling', american: 'Storytelling' },
  'educational': { british: 'Educational', american: 'Educational' },
  'inspirational': { british: 'Inspirational', american: 'Inspirational' },
  'motivational': { british: 'Motivational', american: 'Motivational' },
  'conversational': { british: 'Conversational', american: 'Conversational' },
  'professional': { british: 'Professional', american: 'Professional' },
  'poetic': { british: 'Poetic', american: 'Poetic' },
  'reflective': { british: 'Reflective', american: 'Reflective' },
  'uplifting': { british: 'Uplifting', american: 'Uplifting' },
  'authentic': { british: 'Authentic', american: 'Authentic' },
  'vulnerable': { british: 'Vulnerable', american: 'Vulnerable' },
  'encouraging': { british: 'Encouraging', american: 'Encouraging' },
  'thoughtful': { british: 'Thoughtful', american: 'Thoughtful' },
  'warm': { british: 'Warm', american: 'Warm' },
  'gentle': { british: 'Gentle', american: 'Gentle' },
  'direct': { british: 'Direct', american: 'Direct' },
  'compassionate': { british: 'Compassionate', american: 'Compassionate' },
  'creative': { british: 'Creative', american: 'Creative' },
  'artistic': { british: 'Artistic', american: 'Artistic' },
  'playful': { british: 'Playful', american: 'Playful' },
  'bold': { british: 'Bold', american: 'Bold' },
  'challenging': { british: 'Challenging', american: 'Challenging' },
  'hopeful': { british: 'Hopeful', american: 'Hopeful' },
  
  // Common UI terms that differ
  'color': { british: 'Colour', american: 'Color' },
  'favourite': { british: 'Favourite', american: 'Favorite' },
  'organize': { british: 'Organise', american: 'Organize' },
  'organized': { british: 'Organised', american: 'Organized' },
  'organization': { british: 'Organisation', american: 'Organization' },
  'realize': { british: 'Realise', american: 'Realize' },
  'center': { british: 'Centre', american: 'Center' },
  'centered': { british: 'Centred', american: 'Centered' },
  'theater': { british: 'Theatre', american: 'Theater' },
  'behavior': { british: 'Behaviour', american: 'Behavior' },
  'practice_verb': { british: 'Practise', american: 'Practice' },
  'practice_noun': { british: 'Practice', american: 'Practice' },
  'license_noun': { british: 'Licence', american: 'License' },
  'license_verb': { british: 'License', american: 'License' },
  'grey': { british: 'Grey', american: 'Gray' },
  'analyse': { british: 'Analyse', american: 'Analyze' },
  'dialogue': { british: 'Dialogue', american: 'Dialog' },
  'catalogue': { british: 'Catalogue', american: 'Catalog' },
  
  // Add more terms as needed
}

/**
 * Get localized label based on language variant
 * @param key - The term to localize (e.g., 'humor', 'color')
 * @param language - User's language variant ('British English' or 'American English')
 * @returns Localized label
 */
export function getLocalizedLabel(key: string, language?: string): string {
  const keyLower = key.toLowerCase().trim()
  const isBritish = language?.toLowerCase().includes('british') || language?.toLowerCase().includes('uk')
  
  if (LOCALIZATION_DICTIONARY[keyLower]) {
    return isBritish 
      ? LOCALIZATION_DICTIONARY[keyLower].british 
      : LOCALIZATION_DICTIONARY[keyLower].american
  }
  
  // Fallback: capitalize first letter
  return key.charAt(0).toUpperCase() + key.slice(1)
}

/**
 * Get tone label with localization
 * Convenience function specifically for tone labels
 */
export function getLocalizedToneLabel(tone: string, language?: string): string {
  return getLocalizedLabel(tone, language)
}

/**
 * Detect if user prefers British English
 * @param profile - User profile object
 * @param regional - Regional settings object
 * @returns true if British English, false if American
 */
export function isBritishEnglish(profile?: any, regional?: any): boolean {
  // Check explicit language variant
  if (profile?.languageVariant) {
    return profile.languageVariant.toLowerCase().includes('british')
  }
  
  if (regional?.language) {
    return regional.language.toLowerCase().includes('british')
  }
  
  // Fallback to target audience
  const targetAudience = profile?.targetAudience || profile?.country
  const britishCountries = [
    'United Kingdom', 
    'UK', 
    'Great Britain',
    'Ireland', 
    'Australia', 
    'New Zealand',
    'South Africa'
  ]
  
  return britishCountries.some(country => 
    targetAudience?.toLowerCase().includes(country.toLowerCase())
  )
}

/**
 * Get user's language variant string
 * @param profile - User profile object
 * @param regional - Regional settings object
 * @returns 'British English' or 'American English'
 */
export function getUserLanguageVariant(profile?: any, regional?: any): string {
  if (profile?.languageVariant) {
    return profile.languageVariant
  }
  
  if (regional?.language) {
    return regional.language
  }
  
  return isBritishEnglish(profile, regional) ? 'British English' : 'American English'
}

/**
 * React hook for getting localized labels
 * Usage: const t = useLocalization(profile, regional)
 *        <label>{t('humor')}</label>  // Shows "Humour" or "Humor"
 */
export function useLocalization(profile?: any, regional?: any) {
  const language = getUserLanguageVariant(profile, regional)
  
  return (key: string) => getLocalizedLabel(key, language)
}

/**
 * Batch localize an object with keys
 * Useful for localizing toneMix or other objects
 * 
 * @example
 * const toneMix = { emotional: 30, humor: 20 }
 * const localized = localizeObject(toneMix, 'British English')
 * // Returns: { Emotional: 30, Humour: 20 }
 */
export function localizeObject(
  obj: Record<string, any>, 
  language?: string
): Record<string, any> {
  const localized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const localizedKey = getLocalizedLabel(key, language)
    localized[localizedKey] = value
  }
  
  return localized
}

// Export the dictionary for reference if needed
export { LOCALIZATION_DICTIONARY }