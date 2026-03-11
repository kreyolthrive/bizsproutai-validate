'use client';

/**
 * Complete Validation + Roadmap Flow
 * Example integration component
 */

import React, { useEffect, useMemo, useState } from 'react';
import GenerateRoadmapButton from '@/components/GenerateRoadmapButton';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import StartSprintModal from '@/components/sprint/StartSprintModal';
import { DEFAULT_SPRINT_SETTINGS } from '@/src/sprint/config';
import type { SprintIntensity, SprintSettings } from '@/src/sprint/types';

const USER_ID_STORAGE_KEY = 'bizsprout.user.id';

function getOrCreateAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing) return existing;

  const generated = `anon_${crypto.randomUUID()}`;
  window.localStorage.setItem(USER_ID_STORAGE_KEY, generated);
  return generated;
}

export default function ValidationRoadmapFlow() {
  const [step, setStep] = useState<'input' | 'validating' | 'validated' | 'roadmap'>('input');
  const [idea, setIdea] = useState('');
  const [country, setCountry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [sprintSettings, setSprintSettings] = useState<SprintSettings>(DEFAULT_SPRINT_SETTINGS);
  const [sprintSettingsLoading, setSprintSettingsLoading] = useState(false);
  const [sprintSettingsError, setSprintSettingsError] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getOrCreateAnonymousUserId());
  }, []);

  useEffect(() => {
    if (step === 'validated' && !sprintSettingsLoading && !sprintSettings.onboardingCompleted) {
      setShowSprintModal(true);
    }
  }, [step, sprintSettings.onboardingCompleted, sprintSettingsLoading]);

  const projectSprintKey = useMemo(() => {
    const type = (businessType || validationResult?.businessCategory || 'general').toLowerCase();
    const compactIdea = idea.trim().toLowerCase().slice(0, 80);
    return `${type}:${compactIdea || 'untitled'}`;
  }, [businessType, validationResult, idea]);

  useEffect(() => {
    if (!userId || !projectSprintKey) return;

    let cancelled = false;
    const loadSettings = async () => {
      setSprintSettingsLoading(true);
      setSprintSettingsError(null);
      try {
        const response = await fetch(
          `/api/sprint/settings?userId=${encodeURIComponent(userId)}&projectKey=${encodeURIComponent(projectSprintKey)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load sprint settings');
        }

        const payload = await response.json();
        if (!cancelled && payload?.settings) {
          setSprintSettings({
            ...DEFAULT_SPRINT_SETTINGS,
            ...payload.settings,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setSprintSettingsError(error instanceof Error ? error.message : 'Unable to load sprint settings');
          setSprintSettings(DEFAULT_SPRINT_SETTINGS);
        }
      } finally {
        if (!cancelled) {
          setSprintSettingsLoading(false);
        }
      }
    };

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [userId, projectSprintKey]);

  const persistSprintSettings = async (patch: Partial<SprintSettings>) => {
    if (!userId || !projectSprintKey) return;

    const nextSettings: SprintSettings = {
      ...sprintSettings,
      ...patch,
    };

    setSprintSettings(nextSettings);
    try {
      const response = await fetch('/api/sprint/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectKey: projectSprintKey,
          settings: nextSettings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save sprint settings');
      }

      const payload = await response.json();
      if (payload?.settings) {
        setSprintSettings({
          ...DEFAULT_SPRINT_SETTINGS,
          ...payload.settings,
        });
      }
    } catch (error) {
      setSprintSettingsError(error instanceof Error ? error.message : 'Unable to save sprint settings');
    }
  };

  const handleValidate = async () => {
    setStep('validating');
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();
      setValidationResult(data);
      setStep('validated');
      
      // Auto-detect country and business type from validation
      if (data.detectedCountry) setCountry(data.detectedCountry);
      if (data.businessCategory) setBusinessType(data.businessCategory);
      if (data.country?.name) setCountry(data.country.name);
      if (data.category) setBusinessType(data.category);
    } catch (error) {
      console.error('Validation failed:', error);
      setStep('input');
    }
  };

  const handleSprintStart = async (intensity: SprintIntensity) => {
    await persistSprintSettings({
      sprintIntensity: intensity,
      onboardingCompleted: true,
      startedAt: new Date().toISOString(),
    });
    setShowSprintModal(false);
  };

  const handleSprintSetLater = () => {
    setShowSprintModal(false);
  };

  const handleRoadmapGenerated = (generatedRoadmap: any) => {
    setRoadmap(generatedRoadmap);
    setStep('roadmap');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Validate Your Startup Idea
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Business Idea
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., A marketplace connecting local artisans with customers in Lagos, Nigeria"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <button
                onClick={handleValidate}
                disabled={!idea}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Validate Idea
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Validating */}
        {step === 'validating' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Validating Your Idea...
            </h2>
            <p className="text-gray-600 mt-2">
              Analyzing market, risks, and opportunities
            </p>
          </div>
        )}

        {/* Step 3: Validation Results */}
        {step === 'validated' && validationResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Validation Complete
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(typeof validationResult.score === 'number'
                      ? validationResult.score
                      : typeof validationResult.overallScore === 'number'
                        ? Math.round(validationResult.overallScore * 20)
                        : 'N/A')}/100
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {businessType || validationResult.category || validationResult.businessCategory}
                  </p>
                </div>
              </div>

              {/* Country & Business Type Inputs */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select country</option>
                    <option value="USA">United States</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="saas">SaaS</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="local_service">Local Service</option>
                    <option value="consulting">Consulting</option>
                    <option value="coaching">Coaching</option>
                  </select>
                </div>
              </div>

              {/* Generate Roadmap Button */}
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">90-Day Sprint Setup</p>
                <p className="mt-1 text-sm text-blue-800">
                  {sprintSettings.onboardingCompleted
                    ? `Pace selected: ${sprintSettings.sprintIntensity}. You can adjust this any time.`
                    : 'Start your Sprint onboarding to choose pace and unlock guided Week 1 tasks.'}
                </p>
                {sprintSettingsLoading && (
                  <p className="mt-2 text-xs text-blue-700">Loading your sprint settings...</p>
                )}
                {sprintSettingsError && (
                  <p className="mt-2 text-xs text-red-700">{sprintSettingsError}</p>
                )}
                <button
                  onClick={() => setShowSprintModal(true)}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {sprintSettings.onboardingCompleted ? 'Update Sprint pace' : 'Start 90-Day Sprint'}
                </button>
              </div>

              <GenerateRoadmapButton
                idea={idea}
                country={country}
                businessType={businessType}
                validationData={validationResult}
                sprintSettings={sprintSettings}
                onRoadmapGenerated={handleRoadmapGenerated}
              />
            </div>
          </div>
        )}

        {/* Step 4: Roadmap Display */}
        {step === 'roadmap' && roadmap && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <RoadmapDisplay
              roadmap={roadmap}
              businessType={businessType || validationResult?.category || validationResult?.businessCategory}
              validationData={validationResult}
              userId={userId}
              sprintSettings={sprintSettings}
              projectSprintKey={projectSprintKey}
              onClose={() => setStep('validated')}
            />
          </div>
        )}

        <StartSprintModal
          open={showSprintModal}
          defaultIntensity={sprintSettings.sprintIntensity}
          onClose={() => setShowSprintModal(false)}
          onStart={(intensity) => {
            void handleSprintStart(intensity);
          }}
          onSetLater={handleSprintSetLater}
        />
      </div>
    </div>
  );
}
