"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { SprintIntensity } from "@/src/sprint/types";

interface StartSprintModalProps {
  open: boolean;
  defaultIntensity: SprintIntensity;
  onClose: () => void;
  onStart: (intensity: SprintIntensity) => void;
  onSetLater: () => void;
}

const INTENSITY_OPTIONS: Array<{
  value: SprintIntensity;
  title: string;
  subtitle: string;
}> = [
  { value: "light", title: "Light - 3-4 hours per week", subtitle: "2-3 small tasks" },
  { value: "standard", title: "Standard - 6-8 hours per week", subtitle: "4-6 tasks" },
  { value: "intensive", title: "Intensive - 10+ hours per week", subtitle: "More aggressive goals" },
];

export default function StartSprintModal({
  open,
  defaultIntensity,
  onClose,
  onStart,
  onSetLater,
}: StartSprintModalProps) {
  const [step, setStep] = useState(0);
  const [selectedIntensity, setSelectedIntensity] = useState<SprintIntensity>(defaultIntensity);

  useEffect(() => {
    if (open) {
      setStep(0);
      setSelectedIntensity(defaultIntensity);
    }
  }, [open, defaultIntensity]);

  const totalSteps = 4;
  const progress = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
            <span>
              Step {step + 1} of {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {step === 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to your 90-Day Launch &amp; First Sale Sprint</h2>
            <p className="text-gray-700">
              Over the next 90 days, BizSproutAI will guide you from raw idea to real customers and first sales.
              You&rsquo;ll follow a clear path with three phases: Clarity &amp; Assets, Launch &amp; Leads, and Sales &amp;
              Iteration.
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">What you'll do each week</h2>
            <p className="text-gray-700">
              Each week, you'll complete 2-4 focused tasks: clarifying your offer, improving your page or app,
              talking to potential customers, and sending real outreach. No giant to-do list, just the next right
              steps.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="rounded-lg bg-gray-50 px-3 py-2">We highlight the highest-impact tasks for you.</li>
              <li className="rounded-lg bg-gray-50 px-3 py-2">You mark them done and see your progress.</li>
              <li className="rounded-lg bg-gray-50 px-3 py-2">You can go light or intensive depending on your time.</li>
            </ul>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Your Launch Agent: a coach inside the app</h2>
            <p className="text-gray-700">
              Your Launch Agent watches your progress and tells you exactly what to do next. Every time you log in,
              you'll see 1-3 priority tasks plus ready-to-use messages and content.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="rounded-lg bg-gray-50 px-3 py-2">"Do this next" tasks, not a long checklist.</li>
              <li className="rounded-lg bg-gray-50 px-3 py-2">Ready scripts for DMs, emails, and posts.</li>
              <li className="rounded-lg bg-gray-50 px-3 py-2">Short explanations of why each task matters.</li>
            </ul>
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Watch this 60-second overview of how the Sprint and Launch Agent work.
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Choose how intense you want this Sprint to be</h2>
            <p className="text-gray-700">
              How many hours can you realistically give this each week? Your Launch Agent will adjust the number of
              tasks to match your pace.
            </p>
            <div className="space-y-2">
              {INTENSITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                    selectedIntensity === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                    <p className="text-xs text-gray-600">{option.subtitle}</p>
                  </div>
                  <input
                    type="radio"
                    name="sprintIntensity"
                    className="h-4 w-4"
                    checked={selectedIntensity === option.value}
                    onChange={() => setSelectedIntensity(option.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">
            Close
          </button>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep((current) => Math.min(current + 1, totalSteps - 1))}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={onSetLater} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  I'll set this later
                </button>
                <button
                  onClick={() => onStart(selectedIntensity)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Start my 90-Day Sprint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
