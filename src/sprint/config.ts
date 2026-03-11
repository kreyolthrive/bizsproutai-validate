import { GENERIC_90_DAY_TEMPLATE } from "@/src/sprint/templates/generic90Day";
import type { SprintSettings, SprintTemplate, SprintWeek } from "@/src/sprint/types";

export const DEFAULT_SPRINT_TEMPLATE_ID = "generic_90_day";

const SPRINT_TEMPLATES: Record<string, SprintTemplate> = {
  [DEFAULT_SPRINT_TEMPLATE_ID]: GENERIC_90_DAY_TEMPLATE,
};

export function getSprintTemplate(templateId: string = DEFAULT_SPRINT_TEMPLATE_ID): SprintTemplate {
  return SPRINT_TEMPLATES[templateId] || GENERIC_90_DAY_TEMPLATE;
}

export function getWeekFromTemplate(
  week: number,
  templateId: string = DEFAULT_SPRINT_TEMPLATE_ID
): SprintWeek | null {
  const template = getSprintTemplate(templateId);
  return template.weeks.find((entry) => entry.week === week) || null;
}

export const DEFAULT_SPRINT_SETTINGS: SprintSettings = {
  sprintTemplateId: DEFAULT_SPRINT_TEMPLATE_ID,
  sprintIntensity: "standard",
  onboardingCompleted: false,
  completedTaskIds: [],
};
