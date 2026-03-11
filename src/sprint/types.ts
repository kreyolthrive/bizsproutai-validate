import type { Category } from "@/src/validation/types";

export type SprintIntensity = "light" | "standard" | "intensive";

export type SprintTask = {
  taskId: string;
  title: string;
  why: string;
  how: string;
  module: string;
  ctaLabel: string;
};

export type SprintWeek = {
  week: number;
  goal: string;
  tasks: SprintTask[];
};

export type SprintPhase = {
  id: "phase_1" | "phase_2" | "phase_3";
  title: string;
  daysLabel: string;
  milestones: string[];
};

export type SprintTemplate = {
  sprintTemplateId: string;
  name: string;
  phases: SprintPhase[];
  weeks: SprintWeek[];
};

export type SprintSettings = {
  sprintTemplateId: string;
  sprintIntensity: SprintIntensity;
  onboardingCompleted: boolean;
  startedAt?: string;
  completedTaskIds?: string[];
};

export type MilestoneStatus = {
  id: string;
  label: string;
  completed: boolean;
  reason: string;
  phaseId: SprintPhase["id"];
};

export type MilestoneHeuristicInput = {
  category?: Category | string;
  validationData?: any;
  completedTaskIds: Set<string>;
};
