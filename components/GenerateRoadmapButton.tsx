'use client';

/**
 * Generate Roadmap Button Component
 * Triggers roadmap generation after validation
 */

import React, { useState } from 'react';
import type { SprintSettings } from '@/src/sprint/types';

interface GenerateRoadmapProps {
  idea: string;
  country: string;
  businessType: string;
  validationData?: any;
  sprintSettings?: SprintSettings;
  onRoadmapGenerated?: (roadmap: any) => void;
}

export default function GenerateRoadmapButton({
  idea,
  country,
  businessType,
  validationData,
  sprintSettings,
  onRoadmapGenerated
}: GenerateRoadmapProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          country,
          businessType,
          validationData,
          sprintSettings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      const data = await response.json();
      
      if (data.success && data.roadmap) {
        onRoadmapGenerated?.(data.roadmap);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGenerateRoadmap}
        disabled={loading || !idea || !country || !businessType}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white transition-all
          ${loading || !idea || !country || !businessType
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating Your Build Plan...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generate Build Plan
          </span>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500 text-center">
        Get a step-by-step roadmap tailored to your region
      </p>
    </div>
  );
}
