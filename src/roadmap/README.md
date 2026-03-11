# Localized Roadmap Architect

## Overview

The Localized Roadmap Architect is a system that generates region-specific, step-by-step build plans for startups based on their validated business idea, location, and business type.

## Features

- **Region-Specific Guidance**: Tailored legal, banking, and marketing advice for:
  - USA (North America)
  - Nigeria (Africa)
  - Kenya (Africa)
  - Haiti (Caribbean)
  - Brazil (Latin America)
  - Mexico (Latin America)

- **Three-Phase Roadmap**:
  1. **Legal & Entity Formation**: Company registration, tax setup, compliance
  2. **Infrastructure**: Banking, payments, tech stack, tools
  3. **Launch**: Marketing channels, customer acquisition, metrics

- **Business Type Optimization**: Customized advice for:
  - SaaS
  - Marketplace
  - E-commerce
  - Local Service
  - Consulting
  - Coaching

## Usage

### API Endpoint

```typescript
POST /api/roadmap

Body:
{
  "idea": "A marketplace for handmade crafts in Lagos",
  "country": "Nigeria",
  "businessType": "marketplace",
  "validationData": { /* optional validation results */ }
}

Response:
{
  "success": true,
  "roadmap": {
    "phase_1_legal": { /* legal setup steps */ },
    "phase_2_infrastructure": { /* infrastructure setup */ },
    "phase_3_launch": { /* launch strategy */ },
    "warnings": [ /* region-specific warnings */ ],
    "region_specific_notes": [ /* contextual notes */ ]
  }
}
```

### React Components

#### Generate Roadmap Button

```tsx
import GenerateRoadmapButton from '@/components/GenerateRoadmapButton';

<GenerateRoadmapButton
  idea="Your business idea"
  country="Nigeria"
  businessType="marketplace"
  validationData={validationResults}
  onRoadmapGenerated={(roadmap) => {
    console.log('Roadmap generated:', roadmap);
    setRoadmap(roadmap);
  }}
/>
```

#### Display Roadmap

```tsx
import RoadmapDisplay from '@/components/RoadmapDisplay';

<RoadmapDisplay
  roadmap={roadmap}
  onClose={() => setShowRoadmap(false)}
/>
```

### Programmatic Usage

```typescript
import { generateRoadmap } from '@/src/roadmap';

const roadmap = await generateRoadmap({
  idea: "A SaaS tool for small businesses",
  region: "North America",
  country: "USA",
  businessType: "saas",
  validationData: null
});

console.log(roadmap);
```

## Extending the System

### Adding a New Country

1. Add country configuration to `src/roadmap/constants.ts`:

```typescript
export const REGION_CONFIGS: Record<string, RegionConfig> = {
  // ... existing configs
  'africa_ghana': {
    region: 'Africa',
    countries: ['Ghana', 'GH'],
    currency: 'GHS',
    legal_structure: ['Private Limited Company', 'Business Name'],
    banking_providers: ['Ecobank', 'GCB Bank', 'Stanbic'],
    payment_processors: ['Paystack', 'Flutterwave', 'Hubtel'],
    marketing_channels: ['WhatsApp', 'Facebook', 'Instagram', 'Radio'],
    common_warnings: [
      'Register with Registrar General Department',
      'Get TIN from Ghana Revenue Authority'
    ]
  }
};
```

2. Add mapping in `src/roadmap/engine/regionMapper.ts`:

```typescript
const mapping: Record<string, string> = {
  // ... existing mappings
  'GH': 'africa_ghana',
  'GHANA': 'africa_ghana'
};
```

3. Add template in `src/roadmap/engine/templateBuilder.ts`:

```typescript
const templates: Record<string, any> = {
  // ... existing templates
  'africa_ghana': {
    step_name: 'Register with Registrar General',
    description: `/* Ghana-specific instructions */`,
    estimated_cost: 'GHS 500-2,000',
    estimated_timeline: '2-3 weeks'
  }
};
```

### Adding a New Business Type

Add to `BUSINESS_TYPE_GUIDANCE` in `src/roadmap/constants.ts`:

```typescript
export const BUSINESS_TYPE_GUIDANCE: Record<string, any> = {
  // ... existing types
  'ai_tool': {
    infrastructure_focus: 'AI/ML infrastructure, API management, scalable compute',
    launch_strategy: 'Developer community, API documentation, Freemium model',
    key_metrics: 'API calls, MAU, Conversion rate, Usage per user'
  }
};
```

## Architecture

```
src/roadmap/
├── types.ts              # TypeScript interfaces
├── constants.ts          # Region configs & templates
├── index.ts             # Public API
└── engine/
    ├── orchestrator.ts   # Main generation logic
    ├── regionMapper.ts   # Country → Region mapping
    └── templateBuilder.ts # Phase builders

app/api/roadmap/
└── route.ts             # Next.js API route

components/
├── GenerateRoadmapButton.tsx
└── RoadmapDisplay.tsx
```

## Key Principles

1. **Region-First**: Every recommendation considers local legal, banking, and cultural context
2. **Actionable**: Specific steps with cost estimates and timelines
3. **Warning-Heavy**: Proactive alerts about common pitfalls
4. **Extensible**: Easy to add new countries and business types
5. **Data-Driven**: Can incorporate validation results for personalization

## Future Enhancements

- [ ] AI-enhanced personalization using Claude/GPT
- [ ] PDF export functionality
- [ ] Multi-language support
- [ ] Integration with task management tools
- [ ] Cost calculator with live currency conversion
- [ ] Legal document templates
- [ ] Partner network recommendations
