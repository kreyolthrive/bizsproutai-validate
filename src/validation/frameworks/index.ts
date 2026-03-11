import type { Category, FrameworkDefinition } from "../types";
import { ecommerceFramework } from "./ecommerce";
import { coachingFramework } from "./coaching";
import { consultingFramework } from "./consulting";
import { financeFramework } from "./finance";
import { techFramework } from "./tech";
import { saasFramework } from "./saas";
import { marketplaceFramework } from "./marketplace";
import { localServiceFramework } from "./local_service";
import { healthWellnessFramework } from "./health_wellness";
import { edtechFramework } from "./edtech";
import { legalLawFramework } from "./legal_law";

export const frameworks: FrameworkDefinition[] = [
  ecommerceFramework,
  coachingFramework,
  consultingFramework,
  financeFramework,
  techFramework,
  saasFramework,
  marketplaceFramework,
  localServiceFramework,
  healthWellnessFramework,
  edtechFramework,
  legalLawFramework
];

export const frameworksByCategory = frameworks.reduce((acc, f) => {
  acc[f.category] = f;
  return acc;
}, {} as Record<Category, FrameworkDefinition>);
