import { UserProfile, RegionalConfig, Project, Holiday, CulturalEvent } from '../types';

export interface TopicGenerationContext {
  profile: UserProfile;
  regional: RegionalConfig;
  project: Project;
  customEvents: CulturalEvent[];
}

export function buildTopicGenerationPrompt(context: TopicGenerationContext): string {
  const { profile, regional, project, customEvents } = context;

  const toneDistribution = Object.entries(project.toneMix)
    .map(([tone, percentage]) => {
      const count = Math.round((percentage / 100) * project.videosNeeded);
      return `${tone}: ${count} videos (${percentage}%)`;
    })
    .join('\n');

  const projectDate = new Date(project.month);
  const relevantHolidays = regional.configData.holidays
    .filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.getMonth() === projectDate.getMonth() &&
             holidayDate.getFullYear() === projectDate.getFullYear();
    })
    .map(h => `- ${h.name} (${h.date}) - ${h.type} - priority: ${h.priority}`)
    .join('\n');

  const formattedCustomEvents = customEvents
    .map(e => `- ${e.name} (${e.date}) - ${e.description}`)
    .join('\n');

  return `You are an expert YouTube Shorts content strategist. Generate ${project.videosNeeded} high-potential YouTube Shorts topics customized for this creator's unique context.

CREATOR PROFILE:
Name: ${profile.name}
Channel: ${profile.channelName}
Niche: ${profile.niche}
Unique Angle: ${profile.uniqueAngle}

VOICE & TONE:
Primary Tone (60%): ${profile.signatureTone.primary}
Secondary Tone (25%): ${profile.signatureTone.secondary}
Accent Tone (15%): ${profile.signatureTone.accent}

Signature Catchphrases:
${profile.catchphrases.map(p => `- "${p}"`).join('\n')}

CONTENT BOUNDARIES:
Won't Cover:
${profile.boundaries.wontCover.map(b => `- ${b}`).join('\n')}

Privacy Limits:
${profile.boundaries.privacyLimits.map(p => `- ${p}`).join('\n')}

REGIONAL CONTEXT:
Location: ${regional.location}
Hemisphere: ${regional.hemisphere}
Timezone: ${regional.timezone}
Language: ${regional.language}

KEY HOLIDAYS THIS MONTH:
${relevantHolidays || 'No major holidays'}

CUSTOM EVENTS:
${formattedCustomEvents || 'No custom events'}

PROJECT DETAILS:
Month: ${project.month}
Total Videos Needed: ${project.videosNeeded}

TONE DISTRIBUTION:
${toneDistribution}

OUTPUT FORMAT (JSON):
Return a JSON array of exactly ${project.videosNeeded} topics with this structure:
[
  {
    "title": "Topic title",
    "hook": "The 3-second opening line...",
    "coreValue": "What viewers will learn/feel",
    "emotionalDriver": "surprise|nostalgia|awe|etc",
    "formatType": "story|tutorial|list|etc",
    "tone": "emotional|calming|storytelling|educational|humor|inspirational",
    "longevity": "evergreen|seasonal|trending",
    "dateRangeStart": "2025-12-01",
    "dateRangeEnd": "2025-12-15",
    "factCheckStatus": "verified|needs_review|opinion",
    "orderIndex": 1
  }
]

Generate the complete list now:`;
}