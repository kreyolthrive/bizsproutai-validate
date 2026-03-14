'use client';

/**
 * Complete Validation + Roadmap Flow
 * Full replacement with:
 * - email input
 * - API error handling
 * - report download support
 * - safer score/category resolution
 */

import React, { useEffect, useMemo, useState } from 'react';
import GenerateRoadmapButton from '@/components/GenerateRoadmapButton';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import StartSprintModal from '@/components/sprint/StartSprintModal';
import { DEFAULT_SPRINT_SETTINGS } from '@/src/sprint/config';
import type { SprintIntensity, SprintSettings } from '@/src/sprint/types';

type ReportPayload = {
  filename: string;
  generatedAt: string;
  text: string;
  pdf?: {
    filename: string;
    mimeType: string;
    contentBase64: string;
    sizeBytes: number;
  } | null;
  pdfError?: string | null;
};

type ValidationApiResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  details?: string;
  requestId?: string;
  report?: ReportPayload;
  category?: string;
  businessCategory?: string;
  business_category?: string;
  country?: {
    name?: string;
    code?: string;
  } | null;
  detectedCountry?: string;
  score?: number;
  overallScore?: number;
  overall_score?: number;
  confidenceScore?: number;
  confidence_score?: number;
  validationRun?: {
    saved: boolean;
    runId: string | null;
    error: string | null;
  };
  [key: string]: unknown;
};

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function downloadReport(report: ReportPayload): void {
  if (report.pdf?.contentBase64) {
    const byteString = window.atob(report.pdf.contentBase64);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i += 1) {
      bytes[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: report.pdf.mimeType || 'application/pdf',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.pdf.filename || 'bizsproutai-validation-report.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const blob = new Blob([report.text], {
    type: 'text/plain;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = report.filename || 'bizsproutai-validation-report.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resolveScore(value: ValidationApiResponse | null): string {
  if (!value) return 'N/A';

  if (typeof value.overall_score === 'number') {
    return `${value.overall_score}/100`;
  }

  if (typeof value.score === 'number') {
    return `${value.score}/100`;
  }

  if (typeof value.overallScore === 'number') {
    return value.overallScore > 5
      ? `${Math.round(value.overallScore)}/100`
      : `${Math.round(value.overallScore * 20)}/100`;
  }

  return 'N/A';
}

function resolveCategory(value: ValidationApiResponse | null): string {
  if (!value) return '';
  return (
    value.businessCategory ||
    value.business_category ||
    value.category ||
    ''
  );
}

export default function ValidationRoadmapFlow() {
  const [step, setStep] = useState<'input' | 'validating' | 'validated' | 'roadmap'>('input');
  const [idea, setIdea] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationApiResponse | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintSettings, setSprintSettings] = useState<SprintSettings>(DEFAULT_SPRINT_SETTINGS);
  const [sprintSettingsLoading, setSprintSettingsLoading] = useState(false);
  const [sprintSettingsError, setSprintSettingsError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

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
    if (!projectSprintKey) return;

    let cancelled = false;

    const loadSettings = async () => {
      setSprintSettingsLoading(true);
      setSprintSettingsError(null);

      try {
        const response = await fetch(
          `/api/sprint/settings?projectKey=${encodeURIComponent(projectSprintKey)}`
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
          setSprintSettingsError(
            error instanceof Error ? error.message : 'Unable to load sprint settings'
          );
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
  }, [projectSprintKey]);

  const persistSprintSettings = async (patch: Partial<SprintSettings>) => {
    if (!projectSprintKey) return;

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
      setSprintSettingsError(
        error instanceof Error ? error.message : 'Unable to save sprint settings'
      );
    }
  };

  const handleValidate = async () => {
    const trimmedIdea = idea.trim();
    const trimmedEmail = email.trim();

    setValidationError(null);
    setDownloadStatus(null);
    setValidationResult(null);
    setRoadmap(null);

    if (trimmedIdea.length < 10) {
      setValidationError('Please enter a more detailed business idea.');
      return;
    }

    if (!trimmedEmail) {
      setValidationError('Please enter your email to receive your validation report.');
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setStep('validating');

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: trimmedIdea,
          email: trimmedEmail,
          locale: 'en',
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text.slice(0, 160) || 'Invalid server response.');
      }

      const data = (await response.json()) as ValidationApiResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Validation failed.');
      }

      setValidationResult(data);
      setStep('validated');

      if (data.report) {
        try {
          downloadReport(data.report);
          setDownloadStatus(
            data.report.pdf
              ? 'Your PDF report downloaded successfully.'
              : 'Your text report downloaded successfully.'
          );
        } catch (error) {
          console.error('Report download failed:', error);
          setDownloadStatus('Your validation completed, but the report download failed.');
        }
      } else {
        setDownloadStatus('Validation completed, but no downloadable report was returned.');
      }

      if (data.detectedCountry) {
        setCountry(data.detectedCountry);
      }

      if (data.businessCategory) {
        setBusinessType(data.businessCategory);
      }

      if (data.country?.name) {
        setCountry(data.country.name);
      }

      if (data.category) {
        setBusinessType(data.category);
      }

      if (data.business_category && !data.businessCategory && !data.category) {
        setBusinessType(data.business_category);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationError(
        error instanceof Error ? error.message : 'Validation failed.'
      );
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

  const resolvedScore = resolveScore(validationResult);
  const resolvedCategory = businessType || resolveCategory(validationResult);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="e.g., A marketplace connecting local artisans with customers in Lagos, Nigeria"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="you@example.com"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {validationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {validationError}
                </div>
              )}

              <button
                onClick={handleValidate}
                disabled={!idea.trim() || !email.trim()}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Validate Idea
              </button>
            </div>
          </div>
        )}

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

        {step === 'validated' && validationResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Validation Complete
              </h2>

              {downloadStatus && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {downloadStatus}
                </div>
              )}

              {validationError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {resolvedScore}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {resolvedCategory || 'N/A'}
                  </p>
                </div>
              </div>

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

        {step === 'roadmap' && roadmap && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <RoadmapDisplay
              roadmap={roadmap}
              businessType={
                businessType ||
                validationResult?.category ||
                validationResult?.businessCategory ||
                validationResult?.business_category
              }
              validationData={validationResult}
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
