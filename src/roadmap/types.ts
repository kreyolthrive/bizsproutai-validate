/**
 * Roadmap Generation Types
 * Types for the Localized Roadmap Architect system
 */

import type { SprintIntensity, SprintTask } from "@/src/sprint/types";

export interface RoadmapPhase {
  step_name: string;
  description: string;
  estimated_cost?: string;
  estimated_timeline?: string;
  resources?: string[];
}

export interface RoadmapOutput {
  phase_1_legal: RoadmapPhase;
  phase_2_infrastructure: RoadmapPhase;
  phase_3_launch: RoadmapPhase;
  warnings: string[];
  region_specific_notes?: string[];
  sprint?: {
    sprintTemplateId: string;
    sprintIntensity: SprintIntensity;
    week1Goal: string;
    week1Tasks: SprintTask[];
  };
}

export interface RoadmapInput {
  idea: string;
  region: string;
  country: string;
  businessType: string;
  validationScore?: number;
  validationData?: any;
  sprintSettings?: {
    sprintTemplateId?: string;
    sprintIntensity?: SprintIntensity;
    onboardingCompleted?: boolean;
  };
}

export interface RegionConfig {
  region: string;
  countries: string[];
  currency: string;
  legal_structure: string[];
  banking_providers: string[];
  payment_processors: string[];
  marketing_channels: string[];
  common_warnings: string[];
}
