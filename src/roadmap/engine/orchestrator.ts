/**
 * Roadmap Orchestrator
 * Main engine for generating localized build plans
 */

import { RoadmapInput, RoadmapOutput } from '../types';
import { DEFAULT_WARNINGS } from '../constants';
import { getRegionConfig, normalizeCountryName } from './regionMapper';
import { buildLegalPhase, buildInfrastructurePhase, buildLaunchPhase } from './templateBuilder';
import { DEFAULT_SPRINT_SETTINGS, getWeekFromTemplate } from '@/src/sprint/config';

export async function generateRoadmap(input: RoadmapInput): Promise<RoadmapOutput> {
  const { country, businessType, validationData, sprintSettings } = input;
  
  // Get region configuration
  const regionConfig = getRegionConfig(country);
  const normalizedCountry = normalizeCountryName(country);
  
  // Build phases
  const phase1 = buildLegalPhase(regionConfig, normalizedCountry);
  const phase2 = buildInfrastructurePhase(regionConfig, businessType);
  const phase3 = buildLaunchPhase(regionConfig, businessType);
  
  // Compile warnings
  const warnings = [
    ...regionConfig.common_warnings,
    ...DEFAULT_WARNINGS
  ];
  
  // Add region-specific notes
  const region_specific_notes = [
    `This roadmap is optimized for ${normalizedCountry} in the ${regionConfig.region} region.`,
    `All costs are estimated in ${regionConfig.currency}. Actual costs may vary.`,
    `Legal and tax requirements are based on current regulations as of ${new Date().getFullYear()}.`
  ];
  
  // Add validation-based notes if available
  if (validationData) {
    if (validationData.risks && validationData.risks.length > 0) {
      region_specific_notes.push(`Important: address these risks from validation: ${validationData.risks.slice(0, 2).map((r: any) => r.risk).join(', ')}`);
    }
  }

  const templateId = sprintSettings?.sprintTemplateId || DEFAULT_SPRINT_SETTINGS.sprintTemplateId;
  const sprintWeek1 = getWeekFromTemplate(1, templateId);
  const sprintIntensity = sprintSettings?.sprintIntensity || DEFAULT_SPRINT_SETTINGS.sprintIntensity;
  
  return {
    phase_1_legal: phase1,
    phase_2_infrastructure: phase2,
    phase_3_launch: phase3,
    warnings: warnings,
    region_specific_notes: region_specific_notes,
    sprint: sprintWeek1
      ? {
          sprintTemplateId: templateId,
          sprintIntensity,
          week1Goal: sprintWeek1.goal,
          week1Tasks: sprintWeek1.tasks,
        }
      : undefined,
  };
}

export async function generateRoadmapWithAI(input: RoadmapInput): Promise<RoadmapOutput> {
  // TODO: Implement AI-enhanced roadmap generation using Claude/GPT
  // This would use the templates as a base but add more personalization
  // based on the specific business idea and validation results
  
  // For now, fall back to template-based generation
  return generateRoadmap(input);
}
