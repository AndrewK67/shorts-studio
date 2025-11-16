// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  channelName: string;
  niche: string;
  uniqueAngle: string;
  signatureTone: {
    primary: string;
    secondary: string;
    accent: string;
  };
  catchphrases: string[];
  boundaries: {
    wontCover: string[];
    privacyLimits: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Regional Configuration Types
export interface RegionalConfig {
  id: string;
  userId: string;
  location: string;
  countryCode: string;
  hemisphere: 'Northern' | 'Southern';
  timezone: string;
  language: string;
  configData: {
    holidays: Holiday[];
    culturalEvents: CulturalEvent[];
    seasonalThemes: string[];
    culturalNotes: string[];  // ← ADDED THIS LINE TO FIX THE BUILD ERROR
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'religious' | 'cultural';
  priority: 'critical' | 'important' | 'optional';
}

export interface CulturalEvent {
  date: string;
  name: string;
  description: string;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  month: string;
  videosNeeded: number;
  toneMix: {
    emotional: number;
    calming: number;
    storytelling: number;
    educational: number;
    humor: number;
  };
  status: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete';
  createdAt: string;
  updatedAt: string;
}

// Topic Types
export interface Topic {
  id: string;
  projectId: string;
  title: string;
  hook: string;
  coreValue: string;
  emotionalDriver: string;
  formatType: string;
  tone: 'emotional' | 'calming' | 'storytelling' | 'educational' | 'humor' | 'inspirational';
  longevity: 'evergreen' | 'seasonal' | 'trending';
  factCheckStatus: 'verified' | 'needs_review' | 'opinion';
  dateRangeStart: string;
  dateRangeEnd: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Script Types
export interface Script {
  id: string;
  topicId: string;
  projectId: string;
  content: string;
  hook: string;
  readingTime: number;
  deliveryNotes: {
    pacing: string;
    energy: number;
    pauses: string[];
    emphasis: string[];
  };
  visualCues: {
    gestures: string[];
    bRoll: string[];
    framing: string;
    lighting: string;
  };
  factCheckNotes: {
    claims: string[];
    sources: string[];
    verifiedAt?: string;
  };
  verificationStatus: 'verified' | 'needs_review' | 'pending';
  verifiedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}