// Regional configuration and holiday data for onboarding

export interface RegionalConfig {
  location: string
  country: string
  languageVariant: string
  targetAudience: string
  holidays: Holiday[]
}

export interface Holiday {
  name: string
  date: string
  type: 'cultural' | 'religious' | 'national' | 'seasonal'
}

// Sample regional configurations
const regionalConfigs: Record<string, RegionalConfig> = {
  'GB': {
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    languageVariant: 'British English',
    targetAudience: 'United Kingdom',
    holidays: [
      { name: 'Christmas Day', date: '12-25', type: 'cultural' },
      { name: 'Boxing Day', date: '12-26', type: 'cultural' },
      { name: "New Year's Day", date: '01-01', type: 'national' },
      { name: 'Easter Sunday', date: '04-20', type: 'religious' },
      { name: 'Early May Bank Holiday', date: '05-05', type: 'national' },
      { name: 'Spring Bank Holiday', date: '05-26', type: 'national' },
      { name: 'Summer Bank Holiday', date: '08-25', type: 'national' },
    ]
  },
  'US': {
    location: 'New York, United States',
    country: 'United States',
    languageVariant: 'American English',
    targetAudience: 'United States',
    holidays: [
      { name: "New Year's Day", date: '01-01', type: 'national' },
      { name: 'Martin Luther King Jr. Day', date: '01-20', type: 'national' },
      { name: "Presidents' Day", date: '02-17', type: 'national' },
      { name: 'Memorial Day', date: '05-26', type: 'national' },
      { name: 'Independence Day', date: '07-04', type: 'national' },
      { name: 'Labor Day', date: '09-01', type: 'national' },
      { name: 'Thanksgiving', date: '11-27', type: 'cultural' },
      { name: 'Christmas Day', date: '12-25', type: 'cultural' },
    ]
  },
  'CA': {
    location: 'Toronto, Canada',
    country: 'Canada',
    languageVariant: 'Canadian English',
    targetAudience: 'Canada',
    holidays: [
      { name: "New Year's Day", date: '01-01', type: 'national' },
      { name: 'Family Day', date: '02-17', type: 'national' },
      { name: 'Good Friday', date: '04-18', type: 'religious' },
      { name: 'Victoria Day', date: '05-19', type: 'national' },
      { name: 'Canada Day', date: '07-01', type: 'national' },
      { name: 'Labour Day', date: '09-01', type: 'national' },
      { name: 'Thanksgiving', date: '10-13', type: 'cultural' },
      { name: 'Remembrance Day', date: '11-11', type: 'national' },
      { name: 'Christmas Day', date: '12-25', type: 'cultural' },
      { name: 'Boxing Day', date: '12-26', type: 'cultural' },
    ]
  },
  'AU': {
    location: 'Sydney, Australia',
    country: 'Australia',
    languageVariant: 'Australian English',
    targetAudience: 'Australia',
    holidays: [
      { name: "New Year's Day", date: '01-01', type: 'national' },
      { name: 'Australia Day', date: '01-26', type: 'national' },
      { name: 'Good Friday', date: '04-18', type: 'religious' },
      { name: 'Easter Monday', date: '04-21', type: 'religious' },
      { name: 'Anzac Day', date: '04-25', type: 'national' },
      { name: "Queen's Birthday", date: '06-09', type: 'national' },
      { name: 'Christmas Day', date: '12-25', type: 'cultural' },
      { name: 'Boxing Day', date: '12-26', type: 'cultural' },
    ]
  },
}

export function getRegionalConfig(countryCode: string): RegionalConfig | null {
  return regionalConfigs[countryCode.toUpperCase()] || null
}

export function getHolidaysForMonth(countryCode: string, month: number): Holiday[] {
  const config = getRegionalConfig(countryCode)
  if (!config) return []

  return config.holidays.filter(holiday => {
    const holidayMonth = parseInt(holiday.date.split('-')[0])
    return holidayMonth === month
  })
}

export function getAllCountries(): Array<{ code: string; name: string }> {
  return [
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
  ]
}

export function detectCountryFromLocation(location: string): string {
  const locationLower = location.toLowerCase()
  
  if (locationLower.includes('uk') || 
      locationLower.includes('united kingdom') || 
      locationLower.includes('london') ||
      locationLower.includes('england') ||
      locationLower.includes('scotland') ||
      locationLower.includes('wales')) {
    return 'GB'
  }
  
  if (locationLower.includes('us') || 
      locationLower.includes('usa') ||
      locationLower.includes('united states') ||
      locationLower.includes('america')) {
    return 'US'
  }
  
  if (locationLower.includes('canada') || 
      locationLower.includes('toronto') ||
      locationLower.includes('vancouver')) {
    return 'CA'
  }
  
  if (locationLower.includes('australia') || 
      locationLower.includes('sydney') ||
      locationLower.includes('melbourne')) {
    return 'AU'
  }
  
  return 'US' // Default
}
