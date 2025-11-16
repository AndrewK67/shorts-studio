// src/components/onboarding/StepTwo.tsx
// Updated to capture BOTH creator location and target audience

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRegionalConfig, getHolidaysForMonth } from '@/lib/regional-data';
import { Loader2, MapPin, Users } from 'lucide-react';

interface StepTwoProps {
  onNext: (data: RegionalSettings) => void;
  onBack: () => void;
  initialData?: RegionalSettings;
}

interface RegionalSettings {
  creatorCountry: string;
  creatorCity: string;
  targetCountry: string;
}

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh'] },
  { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'] },
  { code: 'CA', name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'] },
  { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'] },
  { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'] },
  { code: 'ZA', name: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
];

export default function StepTwo({ onNext, onBack, initialData }: StepTwoProps) {
  const [creatorCountry, setCreatorCountry] = useState(initialData?.creatorCountry || '');
  const [creatorCity, setCreatorCity] = useState(initialData?.creatorCity || '');
  const [targetCountry, setTargetCountry] = useState(initialData?.targetCountry || '');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === creatorCountry);
  const canProceed = creatorCountry && creatorCity && targetCountry;

  const handleGeneratePreview = async () => {
    if (!targetCountry) return;
    
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPreview(true);
    setIsGenerating(false);
  };

  const handleNext = () => {
    if (!canProceed) return;
    
    onNext({
      creatorCountry,
      creatorCity,
      targetCountry,
    });
  };

  // Get preview data
  const targetConfig = targetCountry ? getRegionalConfig(targetCountry) : null;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const upcomingHolidays = targetConfig 
    ? getHolidaysForMonth(targetCountry, currentYear, currentMonth).slice(0, 5)
    : [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Where Are You & Who Are You Targeting?</h2>
        <p className="text-gray-600">
          We'll use your location for language settings (spelling, dates, currency) and your target audience for content relevance (holidays, cultural references).
        </p>
      </div>

      {/* Creator Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Your Location
          </CardTitle>
          <CardDescription>
            Where are you creating content from? This affects language settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creator-country">Country</Label>
            <Select value={creatorCountry} onValueChange={setCreatorCountry}>
              <SelectTrigger id="creator-country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {creatorCountry && (
            <div className="space-y-2">
              <Label htmlFor="creator-city">City (optional)</Label>
              <Select value={creatorCity} onValueChange={setCreatorCity}>
                <SelectTrigger id="creator-city">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCountry?.cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {creatorCountry && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <p className="font-medium text-blue-900">Your Settings:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Language: {getRegionalConfig(creatorCountry).language}</li>
                <li>• Date Format: {getRegionalConfig(creatorCountry).dateFormat}</li>
                <li>• Currency: {getRegionalConfig(creatorCountry).currency} ({getRegionalConfig(creatorCountry).currencySymbol})</li>
                <li>• Timezone: {getRegionalConfig(creatorCountry).timezone}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Target Audience
          </CardTitle>
          <CardDescription>
            Who are you creating content for? This affects topic relevance and cultural references.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-country">Target Country</Label>
            <Select value={targetCountry} onValueChange={setTargetCountry}>
              <SelectTrigger id="target-country">
                <SelectValue placeholder="Select target audience country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {targetCountry && (
            <div className="mt-4">
              <Button
                onClick={handleGeneratePreview}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  'Preview Upcoming Holidays & Events'
                )}
              </Button>
            </div>
          )}

          {showPreview && targetConfig && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-3">
              <p className="font-medium text-green-900">Content Will Reference:</p>
              
              {upcomingHolidays.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-800 mb-2">Upcoming Holidays:</p>
                  <ul className="text-sm text-green-700 space-y-1">
                    {upcomingHolidays.map(holiday => (
                      <li key={holiday.date}>
                        • {holiday.name} ({new Date(holiday.date).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-green-800 mb-2">Cultural Notes:</p>
                <ul className="text-sm text-green-700 space-y-1">
                  {targetConfig.configData.culturalNotes.slice(0, 3).map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600">
                  <strong>Example:</strong> When you say "holiday" in your content for {targetConfig.country}, 
                  we'll understand it means "{targetConfig.terminology.holiday}".
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      {creatorCountry && targetCountry && creatorCountry !== targetCountry && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div className="space-y-1">
                <p className="font-medium text-yellow-900">Different Creator & Target Locations</p>
                <p className="text-sm text-yellow-800">
                  Perfect! Your scripts will use <strong>{getRegionalConfig(creatorCountry).language}</strong> spelling, 
                  but reference <strong>{targetConfig?.country}</strong> holidays and cultural moments.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Example: If you're in the UK targeting US audiences, you'll write in British English 
                  but mention Thanksgiving and July 4th.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          Next: Your Style
        </Button>
      </div>
    </div>
  );
}
