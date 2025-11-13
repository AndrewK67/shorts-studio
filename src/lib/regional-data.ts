// src/lib/regional-data.ts
// Comprehensive regional data system for Shorts Studio

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  description: string;
  type: 'public' | 'cultural' | 'religious' | 'seasonal';
  relevance: 'high' | 'medium' | 'low';
}

export interface RegionalConfig {
  country: string;
  countryCode: string;
  language: string;
  timezone: string;
  hemisphere: 'Northern' | 'Southern';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  currencySymbol: string;
  holidays: Holiday[];
  culturalNotes: string[];
  terminology: {
    holiday: string; // "vacation" in UK, "holiday" in US
    fall: string; // "autumn" in UK, "fall" in US
    [key: string]: string;
  };
}

// UK Regional Configuration
export const UK_CONFIG: RegionalConfig = {
  country: 'United Kingdom',
  countryCode: 'GB',
  language: 'British English',
  timezone: 'Europe/London',
  hemisphere: 'Northern',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'GBP',
  currencySymbol: '£',
  terminology: {
    holiday: 'vacation', // British: holiday = vacation
    fall: 'autumn',
    vacation: 'holiday',
    apartment: 'flat',
    elevator: 'lift',
    truck: 'lorry',
    soccer: 'football',
    candy: 'sweets',
    cookies: 'biscuits',
    fries: 'chips',
    chips: 'crisps',
  },
  culturalNotes: [
    'Bank holidays are important public holidays',
    'Christmas period is significant (24-26 Dec)',
    'August is traditionally "holiday season" when many take vacations',
    'Guy Fawkes Night (5 Nov) is culturally significant',
    'The Queen\'s (now King\'s) official birthday is celebrated in June',
    'Easter is a major holiday period with bank holidays',
    'Pantomime season starts around Christmas',
    'Summer begins around June with longer days',
  ],
  holidays: [
    // 2025 UK Holidays
    { date: '2025-01-01', name: "New Year's Day", description: 'Start of the new year', type: 'public', relevance: 'high' },
    { date: '2025-01-02', name: "New Year's Holiday (Scotland)", description: 'Additional Scottish holiday', type: 'public', relevance: 'medium' },
    { date: '2025-03-17', name: "St Patrick's Day", description: 'Irish cultural celebration', type: 'cultural', relevance: 'medium' },
    { date: '2025-04-18', name: 'Good Friday', description: 'Easter religious observance', type: 'public', relevance: 'high' },
    { date: '2025-04-21', name: 'Easter Monday', description: 'Easter bank holiday', type: 'public', relevance: 'high' },
    { date: '2025-05-05', name: 'Early May Bank Holiday', description: 'Spring bank holiday', type: 'public', relevance: 'high' },
    { date: '2025-05-26', name: 'Spring Bank Holiday', description: 'Late spring bank holiday', type: 'public', relevance: 'high' },
    { date: '2025-06-14', name: "King's Official Birthday", description: 'Royal celebration', type: 'cultural', relevance: 'medium' },
    { date: '2025-08-25', name: 'Summer Bank Holiday', description: 'End of summer holiday', type: 'public', relevance: 'high' },
    { date: '2025-10-31', name: 'Halloween', description: 'Spooky celebrations', type: 'cultural', relevance: 'high' },
    { date: '2025-11-05', name: 'Guy Fawkes Night', description: 'Bonfire Night celebrations', type: 'cultural', relevance: 'high' },
    { date: '2025-11-11', name: 'Remembrance Day', description: 'Honoring war veterans', type: 'cultural', relevance: 'high' },
    { date: '2025-12-24', name: 'Christmas Eve', description: 'Day before Christmas', type: 'cultural', relevance: 'high' },
    { date: '2025-12-25', name: 'Christmas Day', description: 'Major Christian holiday', type: 'public', relevance: 'high' },
    { date: '2025-12-26', name: 'Boxing Day', description: 'Day after Christmas', type: 'public', relevance: 'high' },
    { date: '2025-12-31', name: "New Year's Eve", description: 'End of year celebration', type: 'cultural', relevance: 'high' },
    
    // 2026 UK Holidays (for planning ahead)
    { date: '2026-01-01', name: "New Year's Day", description: 'Start of the new year', type: 'public', relevance: 'high' },
    { date: '2026-04-03', name: 'Good Friday', description: 'Easter religious observance', type: 'public', relevance: 'high' },
    { date: '2026-04-06', name: 'Easter Monday', description: 'Easter bank holiday', type: 'public', relevance: 'high' },
    { date: '2026-05-04', name: 'Early May Bank Holiday', description: 'Spring bank holiday', type: 'public', relevance: 'high' },
    { date: '2026-05-25', name: 'Spring Bank Holiday', description: 'Late spring bank holiday', type: 'public', relevance: 'high' },
    { date: '2026-08-31', name: 'Summer Bank Holiday', description: 'End of summer holiday', type: 'public', relevance: 'high' },
    { date: '2026-12-25', name: 'Christmas Day', description: 'Major Christian holiday', type: 'public', relevance: 'high' },
    { date: '2026-12-26', name: 'Boxing Day', description: 'Day after Christmas', type: 'public', relevance: 'high' },
  ],
};

// US Regional Configuration (for comparison/targeting US audiences)
export const US_CONFIG: RegionalConfig = {
  country: 'United States',
  countryCode: 'US',
  language: 'American English',
  timezone: 'America/New_York',
  hemisphere: 'Northern',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'USD',
  currencySymbol: '$',
  terminology: {
    holiday: 'holiday', // US: holiday = seasonal celebration
    fall: 'fall',
    vacation: 'vacation',
    flat: 'apartment',
    lift: 'elevator',
    lorry: 'truck',
    football: 'soccer',
    sweets: 'candy',
    biscuits: 'cookies',
    chips: 'fries',
    crisps: 'chips',
  },
  culturalNotes: [
    'Thanksgiving (4th Thursday in November) is major family holiday',
    'Super Bowl (early February) is massive cultural event',
    'July 4th is Independence Day - major celebration',
    'Black Friday/Cyber Monday are huge shopping events',
    'Back to school season (late August) is significant',
    'Halloween is major celebration for all ages',
    'Memorial Day and Labor Day bookend summer',
  ],
  holidays: [
    { date: '2025-01-01', name: "New Year's Day", description: 'Start of the new year', type: 'public', relevance: 'high' },
    { date: '2025-01-20', name: 'Martin Luther King Jr. Day', description: 'Civil rights leader commemoration', type: 'public', relevance: 'high' },
    { date: '2025-02-02', name: 'Groundhog Day', description: 'Weather prediction tradition', type: 'cultural', relevance: 'medium' },
    { date: '2025-02-14', name: "Valentine's Day", description: 'Romantic celebration', type: 'cultural', relevance: 'high' },
    { date: '2025-02-17', name: "Presidents' Day", description: 'Honoring US presidents', type: 'public', relevance: 'medium' },
    { date: '2025-03-17', name: "St Patrick's Day", description: 'Irish cultural celebration', type: 'cultural', relevance: 'high' },
    { date: '2025-04-20', name: 'Easter Sunday', description: 'Christian holiday', type: 'religious', relevance: 'high' },
    { date: '2025-05-11', name: "Mother's Day", description: 'Honoring mothers', type: 'cultural', relevance: 'high' },
    { date: '2025-05-26', name: 'Memorial Day', description: 'Honoring fallen soldiers', type: 'public', relevance: 'high' },
    { date: '2025-06-15', name: "Father's Day", description: 'Honoring fathers', type: 'cultural', relevance: 'high' },
    { date: '2025-07-04', name: 'Independence Day', description: 'US national holiday', type: 'public', relevance: 'high' },
    { date: '2025-09-01', name: 'Labor Day', description: 'End of summer, honoring workers', type: 'public', relevance: 'high' },
    { date: '2025-10-31', name: 'Halloween', description: 'Spooky celebrations', type: 'cultural', relevance: 'high' },
    { date: '2025-11-27', name: 'Thanksgiving', description: 'Major family holiday with turkey dinner', type: 'public', relevance: 'high' },
    { date: '2025-11-28', name: 'Black Friday', description: 'Major shopping day', type: 'cultural', relevance: 'high' },
    { date: '2025-12-01', name: 'Cyber Monday', description: 'Online shopping day', type: 'cultural', relevance: 'medium' },
    { date: '2025-12-25', name: 'Christmas Day', description: 'Major Christian holiday', type: 'public', relevance: 'high' },
    { date: '2025-12-31', name: "New Year's Eve", description: 'End of year celebration', type: 'cultural', relevance: 'high' },
  ],
};

// Additional country configs can be added here
export const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  GB: UK_CONFIG,
  UK: UK_CONFIG,
  US: US_CONFIG,
  USA: US_CONFIG,
};

/**
 * Get regional configuration for a country code
 */
export function getRegionalConfig(countryCode: string): RegionalConfig {
  const code = countryCode.toUpperCase();
  return REGIONAL_CONFIGS[code] || US_CONFIG; // Default to US if not found
}

/**
 * Get holidays for a specific month in a region
 */
export function getHolidaysForMonth(
  countryCode: string,
  year: number,
  month: number
): Holiday[] {
  const config = getRegionalConfig(countryCode);
  const monthStr = month.toString().padStart(2, '0');
  const datePrefix = `${year}-${monthStr}`;
  
  return config.holidays.filter(holiday => 
    holiday.date.startsWith(datePrefix)
  );
}

/**
 * Get holidays for a date range in a region
 */
export function getHolidaysForDateRange(
  countryCode: string,
  startDate: string,
  endDate: string
): Holiday[] {
  const config = getRegionalConfig(countryCode);
  
  return config.holidays.filter(holiday => 
    holiday.date >= startDate && holiday.date <= endDate
  );
}

/**
 * Format a date according to regional settings
 */
export function formatDate(date: Date, countryCode: string): string {
  const config = getRegionalConfig(countryCode);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (config.dateFormat === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else {
    return `${month}/${day}/${year}`;
  }
}

/**
 * Get cultural context for content planning
 */
export function getCulturalContext(countryCode: string, month: number): string[] {
  const config = getRegionalConfig(countryCode);
  const monthHolidays = getHolidaysForMonth(countryCode, new Date().getFullYear(), month);
  
  const context: string[] = [];
  
  // Add holiday context
  if (monthHolidays.length > 0) {
    context.push(`Important dates in ${config.country}:`);
    monthHolidays.forEach(holiday => {
      context.push(`- ${holiday.name} (${holiday.date}): ${holiday.description}`);
    });
  }
  
  // Add seasonal context
  if (month >= 12 || month <= 2) {
    context.push(config.hemisphere === 'Northern' ? 'Winter season' : 'Summer season');
  } else if (month >= 3 && month <= 5) {
    context.push(config.hemisphere === 'Northern' ? 'Spring season' : 'Autumn season');
  } else if (month >= 6 && month <= 8) {
    context.push(config.hemisphere === 'Northern' ? 'Summer season' : 'Winter season');
  } else {
    context.push(config.hemisphere === 'Northern' ? 'Autumn season' : 'Spring season');
  }
  
  return context;
}

/**
 * Check if a term needs regional translation
 */
export function translateTerm(term: string, fromCountry: string, toCountry: string): string {
  const fromConfig = getRegionalConfig(fromCountry);
  const toConfig = getRegionalConfig(toCountry);
  
  const termLower = term.toLowerCase();
  
  // If the term exists in the from country's terminology, translate it
  if (fromConfig.terminology[termLower]) {
    const fromTerm = fromConfig.terminology[termLower];
    // Find the key in the to country that matches this value
    for (const [key, value] of Object.entries(toConfig.terminology)) {
      if (key === termLower) {
        return value;
      }
    }
  }
  
  return term; // Return original if no translation found
}

/**
 * Generate a regional prompt context for AI
 * This is what we'll pass to Claude to ensure regionally-appropriate content
 */
export function generateRegionalPromptContext(
  creatorCountryCode: string,
  targetCountryCode: string,
  month: number,
  customEvents?: Array<{ date: string; name: string; description: string }>
): string {
  const creatorConfig = getRegionalConfig(creatorCountryCode);
  const targetConfig = getRegionalConfig(targetCountryCode);
  
  const monthHolidays = getHolidaysForMonth(targetCountryCode, new Date().getFullYear(), month);
  const culturalContext = getCulturalContext(targetCountryCode, month);
  
  let context = `
REGIONAL CONTEXT:

Creator Location: ${creatorConfig.country} (${creatorConfig.countryCode})
- Language: ${creatorConfig.language}
- Use ${creatorConfig.language} spelling (e.g., "colour" not "color", "organise" not "organize")
- Date format: ${creatorConfig.dateFormat}
- Time format: ${creatorConfig.timeFormat}
- Currency: ${creatorConfig.currency} (${creatorConfig.currencySymbol})

Target Audience: ${targetConfig.country} (${targetConfig.countryCode})
- Create content relevant to ${targetConfig.country} culture
- Reference ${targetConfig.country} holidays and events

IMPORTANT TERMINOLOGY:
${Object.entries(targetConfig.terminology).slice(0, 10).map(([key, value]) => 
  `- Use "${value}" not "${key}"`
).join('\n')}

HOLIDAYS & EVENTS THIS MONTH:
${monthHolidays.map(h => `- ${h.name} (${h.date}): ${h.description}`).join('\n')}

${customEvents && customEvents.length > 0 ? `
CUSTOM EVENTS:
${customEvents.map(e => `- ${e.name} (${e.date}): ${e.description}`).join('\n')}
` : ''}

CULTURAL CONTEXT:
${culturalContext.join('\n')}

CULTURAL NOTES FOR ${targetConfig.country}:
${targetConfig.culturalNotes.slice(0, 5).map(note => `- ${note}`).join('\n')}

CRITICAL INSTRUCTIONS:
- DO NOT mention holidays that don't apply to ${targetConfig.country}
- Use ${targetConfig.country}-appropriate cultural references
- Avoid ${creatorCountryCode === targetCountryCode ? 'none' : 'assuming US-centric content'}
- When saying "holiday" in ${targetConfig.country}, it means "${targetConfig.terminology.holiday}"
`;
  
  return context;
}
