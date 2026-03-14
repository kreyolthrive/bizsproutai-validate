'use client';

/**
 * Roadmap Display Component
 * Displays the generated localized build plan + 90-day sprint map.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { computeMilestoneStatuses, computeSprintCompletionPercent } from '@/src/sprint/heuristics';
import { getSprintTemplate, getWeekFromTemplate } from '@/src/sprint/config';
import type { SprintSettings } from '@/src/sprint/types';

interface RoadmapPhase {
  step_name: string;
  description: string;
  estimated_cost?: string;
  estimated_timeline?: string;
  resources?: string[];
}

interface RoadmapData {
  phase_1_legal: RoadmapPhase;
  phase_2_infrastructure: RoadmapPhase;
  phase_3_launch: RoadmapPhase;
  warnings: string[];
  region_specific_notes?: string[];
  sprint?: {
    sprintTemplateId: string;
    sprintIntensity: 'light' | 'standard' | 'intensive';
    week1Goal: string;
    week1Tasks: Array<{
      taskId: string;
      title: string;
      why: string;
      how: string;
      module: string;
      ctaLabel: string;
    }>;
  };
}

interface RoadmapDisplayProps {
  roadmap: RoadmapData;
  businessType?: string;
  validationData?: any;
  sprintSettings?: SprintSettings;
  projectSprintKey?: string;
  onClose?: () => void;
}

const ROADMAP_PHASE_STYLES = [
  {
    border: 'border-blue-200',
    header: 'bg-blue-50 border-blue-200',
    title: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    subtext: 'text-blue-700',
  },
  {
    border: 'border-purple-200',
    header: 'bg-purple-50 border-purple-200',
    title: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
    subtext: 'text-purple-700',
  },
  {
    border: 'border-green-200',
    header: 'bg-green-50 border-green-200',
    title: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
    subtext: 'text-green-700',
  },
];

function getModuleHref(moduleId: string, locale: string): string {
  const map: Record<string, string> = {
    'launch_kit.plan': `/${locale}/launch-kit?tab=plan`,
    'launch_kit.offers': `/${locale}/launch-kit?tab=offers`,
    brand_kit: `/${locale}/brand-kit`,
    website_builder: `/${locale}/website-builder`,
    'website_builder.publish': `/${locale}/website-builder/publish`,
    micro_apps: `/${locale}/micro-apps`,
    social_media_agent: `/${locale}/social-agent`,
  };

  return map[moduleId] || `/${locale}`;
}

export default function RoadmapDisplay({
  roadmap,
  businessType,
  validationData,
  sprintSettings,
  projectSprintKey,
  onClose,
}: RoadmapDisplayProps) {
  const locale = useLocale();
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [taskSyncError, setTaskSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectSprintKey) return;

    let cancelled = false;
    const loadTaskState = async () => {
      try {
        const response = await fetch(
          `/api/sprint/settings?projectKey=${encodeURIComponent(projectSprintKey)}`
        );
        if (!response.ok) return;

        const payload = await response.json();
        if (!cancelled) {
          const nextIds = Array.isArray(payload?.settings?.completedTaskIds)
            ? payload.settings.completedTaskIds.filter((value: unknown): value is string => typeof value === 'string')
            : [];
          setCompletedTaskIds(nextIds);
        }
      } catch (error) {
        if (!cancelled) {
          setTaskSyncError(error instanceof Error ? error.message : 'Unable to sync checklist progress');
        }
      }
    };

    void loadTaskState();
    return () => {
      cancelled = true;
    };
  }, [projectSprintKey]);

  const templateId = sprintSettings?.sprintTemplateId || roadmap.sprint?.sprintTemplateId || 'generic_90_day';
  const template = getSprintTemplate(templateId);
  const week1 = getWeekFromTemplate(1, templateId);

  const weekGoal = roadmap.sprint?.week1Goal || week1?.goal || 'Get clear on your idea and publish a simple page you can share.';
  const weekTasks = roadmap.sprint?.week1Tasks || week1?.tasks || [];

  const completedTaskSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);

  const milestoneStatuses = useMemo(
    () =>
      computeMilestoneStatuses({
        category: businessType,
        validationData,
        completedTaskIds: completedTaskSet,
      }),
    [businessType, validationData, completedTaskSet]
  );

  const sprintProgress = useMemo(() => computeSprintCompletionPercent(milestoneStatuses), [milestoneStatuses]);

  const phases = [
    { key: 'phase_1_legal', data: roadmap.phase_1_legal },
    { key: 'phase_2_infrastructure', data: roadmap.phase_2_infrastructure },
    { key: 'phase_3_launch', data: roadmap.phase_3_launch },
  ];

  const persistCompletedTasks = async (nextTaskIds: string[]) => {
    if (!projectSprintKey) return;
    try {
      const response = await fetch('/api/sprint/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectKey: projectSprintKey,
          settings: {
            sprintTemplateId: sprintSettings?.sprintTemplateId || templateId,
            sprintIntensity: sprintSettings?.sprintIntensity || 'standard',
            onboardingCompleted: sprintSettings?.onboardingCompleted || false,
            startedAt: sprintSettings?.startedAt,
            completedTaskIds: nextTaskIds,
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Unable to save checklist progress');
      }
      setTaskSyncError(null);
    } catch (error) {
      setTaskSyncError(error instanceof Error ? error.message : 'Unable to save checklist progress');
    }
  };

  const toggleTask = (taskId: string) => {
    const nextTaskIds = completedTaskSet.has(taskId)
      ? completedTaskIds.filter((entry) => entry !== taskId)
      : [...completedTaskIds, taskId];

    setCompletedTaskIds(nextTaskIds);
    void persistCompletedTasks(nextTaskIds);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">90-Day Launch &amp; First Sale Sprint</h1>
            <p className="mt-2 text-gray-600">
              Clear 90-day map across Clarity &amp; Assets, Launch &amp; Leads, and Sales &amp; Iteration.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {sprintProgress}% complete
          </span>
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${sprintProgress}%` }} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {template.phases.map((phase) => {
            const phaseMilestones = milestoneStatuses.filter((milestone) => milestone.phaseId === phase.id);
            return (
              <div key={phase.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{phase.daysLabel}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{phase.title}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {phaseMilestones.map((milestone) => (
                    <li key={milestone.id} className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                          milestone.completed
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        {milestone.completed ? (
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path d="M5 10l3 3 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{milestone.label}</p>
                        <p className="text-xs text-gray-500">{milestone.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Week 1 Starter Checklist</h2>
        <p className="mt-2 text-sm text-gray-600">Goal for Week 1: {weekGoal}</p>

        <div className="mt-5 space-y-3">
          {taskSyncError && (
            <p className="text-xs text-red-700">{taskSyncError}</p>
          )}
          {weekTasks.map((task) => {
            const complete = completedTaskSet.has(task.taskId);
            return (
              <div key={task.taskId} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.taskId)}
                      aria-label={`Toggle ${task.title}`}
                      className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded border ${
                        complete
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-transparent'
                      }`}
                    >
                      {complete ? (
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path d="M5 10l3 3 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                      <p className="mt-1 text-xs text-gray-600">
                        <span className="font-semibold">Why: </span>
                        {task.why}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        <span className="font-semibold">How: </span>
                        {task.how}
                      </p>
                    </div>
                  </div>
                  <a
                    href={getModuleHref(task.module, locale)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {task.ctaLabel}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Localized Build Plan</h1>
          <p className="text-gray-600">A step-by-step roadmap tailored to your region and business type</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {roadmap.region_specific_notes && roadmap.region_specific_notes.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Regional Context</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                {roadmap.region_specific_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {phases.map(({ key, data }, index) => {
          const style = ROADMAP_PHASE_STYLES[index] || ROADMAP_PHASE_STYLES[0];
          return (
            <div key={key} className={`bg-white border-2 ${style.border} rounded-lg shadow-sm overflow-hidden`}>
              <div className={`${style.header} px-6 py-4 border-b`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${style.title}`}>
                    Phase {index + 1}: {data.step_name}
                  </h2>
                  <span className={`${style.badge} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {data.estimated_timeline || 'Variable'}
                  </span>
                </div>
                {data.estimated_cost && (
                  <p className={`text-sm ${style.subtext} mt-2`}>
                    <strong>Estimated Cost:</strong> {data.estimated_cost}
                  </p>
                )}
              </div>

              <div className="px-6 py-4">
                <p className="whitespace-pre-line text-sm text-gray-700">
                  {data.description}
                </p>

                {data.resources && data.resources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Resources:</h4>
                    <ul className="flex flex-wrap gap-2">
                      {data.resources.map((resource, idx) => (
                        <li key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {roadmap.warnings && roadmap.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Warnings</h3>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc list-inside">
                {roadmap.warnings.slice(0, 6).map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">How to use your Sprint</p>
        <p className="mt-1 text-sm text-gray-700">
          Focus on high-impact tasks first. Open this Sprint view each session, do the first suggested task, and mark
          progress as you go.
        </p>
      </div>
    </div>
  );
}
