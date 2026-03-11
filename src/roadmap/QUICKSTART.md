# 🚀 Quick Start Guide - Localized Roadmap Architect

## 5-Minute Integration

### Step 1: Import the Components

```tsx
import GenerateRoadmapButton from '@/components/GenerateRoadmapButton';
import RoadmapDisplay from '@/components/RoadmapDisplay';
import { useState } from 'react';
```

### Step 2: Add to Your Page

```tsx
export default function YourPage() {
  const [roadmap, setRoadmap] = useState(null);

  return (
    <div>
      <GenerateRoadmapButton
        idea="A marketplace for handmade crafts"
        country="Nigeria"
        businessType="marketplace"
        onRoadmapGenerated={setRoadmap}
      />
      
      {roadmap && <RoadmapDisplay roadmap={roadmap} />}
    </div>
  );
}
```

### Step 3: Done! 🎉

That's it. You now have a working roadmap generator.

---

## Common Use Cases

### Use Case 1: After Validation

```tsx
function AfterValidation({ validationResult }) {
  return (
    <div>
      <h2>Validation Score: {validationResult.score}</h2>
      
      {validationResult.score >= 50 && (
        <GenerateRoadmapButton
          idea={validationResult.idea}
          country={validationResult.detectedCountry}
          businessType={validationResult.category}
          validationData={validationResult}
          onRoadmapGenerated={(roadmap) => {
            // Save to state, database, etc.
            console.log('Roadmap generated!', roadmap);
          }}
        />
      )}
    </div>
  );
}
```

### Use Case 2: Direct API Call

```tsx
async function generateMyRoadmap() {
  const response = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea: "Your business idea",
      country: "Nigeria",
      businessType: "marketplace"
    })
  });
  
  const data = await response.json();
  return data.roadmap;
}
```

### Use Case 3: Programmatic Generation

```tsx
import { generateRoadmap } from '@/src/roadmap';

const roadmap = await generateRoadmap({
  idea: "AI scheduling tool",
  country: "USA",
  businessType: "saas"
});

console.log(roadmap.phase_1_legal.step_name);
// "Incorporate Your Business"
```

---

## Customization Examples

### Custom Button Styling

```tsx
<GenerateRoadmapButton
  idea={idea}
  country={country}
  businessType={businessType}
  onRoadmapGenerated={setRoadmap}
  className="my-custom-button"  // Add if you modify the component
/>
```

### Custom Loading Message

Edit `components/GenerateRoadmapButton.tsx`:

```tsx
{loading ? (
  <span>Creating your personalized plan...</span>
) : (
  <span>Generate Build Plan</span>
)}
```

### Custom Roadmap Display

Edit `components/RoadmapDisplay.tsx` to match your brand colors, fonts, etc.

---

## Configuration Examples

### Add a New Country

1. **Edit `src/roadmap/constants.ts`:**

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
    marketing_channels: ['WhatsApp', 'Facebook', 'Radio'],
    common_warnings: [
      'Register with Registrar General Department',
      'Budget GHS 500-2,000 for registration'
    ]
  }
};
```

2. **Edit `src/roadmap/engine/regionMapper.ts`:**

```typescript
const mapping: Record<string, string> = {
  // ... existing mappings
  'GH': 'africa_ghana',
  'GHANA': 'africa_ghana'
};
```

3. **Edit `src/roadmap/engine/templateBuilder.ts`:**

```typescript
const templates: Record<string, any> = {
  // ... existing templates
  
  'africa_ghana': {
    step_name: 'Register with Registrar General',
    description: `
**Recommended Structure:** Private Limited Company.

**Steps:**
1. Register via eCitizen portal (https://rg.gov.gh)
2. Reserve business name (GHS 1,050)
3. Submit registration forms
4. Pay fees (GHS 500-2,000)
5. Receive Certificate of Incorporation
6. Get TIN from Ghana Revenue Authority
7. Open business bank account
    `.trim(),
    estimated_cost: 'GHS 500-2,000',
    estimated_timeline: '2-3 weeks'
  }
};
```

4. **Done!** Now Ghana is supported.

---

## Testing

### Test the API

```bash
curl -X POST http://localhost:3000/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A marketplace for handmade goods",
    "country": "Nigeria",
    "businessType": "marketplace"
  }'
```

### Test in Code

```typescript
import { generateRoadmap } from '@/src/roadmap';

// Test Nigerian marketplace
const roadmap1 = await generateRoadmap({
  idea: "Artisan marketplace",
  country: "Nigeria",
  businessType: "marketplace"
});

console.assert(roadmap1.phase_1_legal.estimated_cost.includes('NGN'));
console.assert(roadmap1.warnings.length > 0);

// Test US SaaS
const roadmap2 = await generateRoadmap({
  idea: "Scheduling tool",
  country: "USA",
  businessType: "saas"
});

console.assert(roadmap2.phase_1_legal.estimated_cost.includes('USD'));
```

---

## Debugging

### Enable Debug Logging

Add to `src/roadmap/engine/orchestrator.ts`:

```typescript
export async function generateRoadmap(input: RoadmapInput): Promise<RoadmapOutput> {
  console.log('🔍 Roadmap Input:', input);
  
  const regionConfig = getRegionConfig(input.country);
  console.log('🌍 Region Config:', regionConfig);
  
  const phase1 = buildLegalPhase(regionConfig, input.country);
  console.log('📋 Phase 1:', phase1.step_name);
  
  // ... rest of function
}
```

### Check API Endpoint

```bash
# Get API info
curl http://localhost:3000/api/roadmap

# Response:
{
  "message": "Roadmap API - Use POST to generate a build plan",
  "version": "1.0.0",
  "supported_countries": ["USA", "Nigeria", "Kenya", "Haiti", "Brazil", "Mexico"]
}
```

### Verify Region Mapping

```typescript
import { getRegionConfig } from '@/src/roadmap';

const config = getRegionConfig('Nigeria');
console.log(config.region);        // "Africa"
console.log(config.currency);       // "NGN"
console.log(config.banking_providers); // ["GTBank", "Access Bank", ...]
```

---

## Production Checklist

Before deploying to production:

- [ ] Test all supported countries
- [ ] Test all business types
- [ ] Verify cost estimates are current
- [ ] Check legal information is accurate (consult lawyer if needed)
- [ ] Add analytics tracking
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Add rate limiting to API endpoint
- [ ] Test on mobile devices
- [ ] Verify PDF export works (if implemented)
- [ ] Add loading states and error messages
- [ ] Test with slow internet (throttle network)
- [ ] Verify accessibility (screen readers, keyboard navigation)

---

## Troubleshooting

### Problem: "Country not supported"

**Solution:** Add the country to `REGION_CONFIGS` and update `regionMapper.ts`.

### Problem: "Missing required fields"

**Solution:** Ensure you pass `idea`, `country`, and `businessType` to the API.

### Problem: Costs are outdated

**Solution:** Update cost estimates in `templateBuilder.ts` → `buildLegalPhase()`.

### Problem: Wrong region detected

**Solution:** Check mapping in `regionMapper.ts`. Add explicit mapping if needed.

### Problem: Template not found

**Solution:** Ensure template key matches region config key (e.g., `africa_nigeria`).

---

## Performance Tips

### Cache Region Configs

```typescript
// In orchestrator.ts
const regionConfigCache = new Map();

function getCachedRegionConfig(country: string) {
  if (!regionConfigCache.has(country)) {
    regionConfigCache.set(country, getRegionConfig(country));
  }
  return regionConfigCache.get(country);
}
```

### Lazy Load UI Components

```tsx
import dynamic from 'next/dynamic';

const RoadmapDisplay = dynamic(() => import('@/components/RoadmapDisplay'), {
  loading: () => <p>Loading roadmap...</p>
});
```

### Pre-generate Common Roadmaps

```typescript
// Generate and cache roadmaps for popular combinations
const popularCombos = [
  { country: 'Nigeria', businessType: 'marketplace' },
  { country: 'USA', businessType: 'saas' },
  { country: 'Kenya', businessType: 'local_service' }
];

for (const combo of popularCombos) {
  await generateAndCacheRoadmap(combo);
}
```

---

## Next Steps

1. ✅ Integration complete
2. 🔄 Test with real users
3. 🔄 Collect feedback
4. 🔄 Add more countries
5. 🔄 Implement PDF export
6. 🔄 Add AI personalization
7. 🔄 Build analytics dashboard

---

## Need Help?

- **Documentation**: See `README.md`, `INTEGRATION.md`, `ARCHITECTURE.md`
- **Examples**: Check `__tests__/roadmap.test.ts`
- **API Reference**: See `types.ts` for interfaces
- **Community**: [Link to your Discord/Slack]

---

**Happy Building! 🚀**
