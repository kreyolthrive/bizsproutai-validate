/**
 * Roadmap Template Builder
 * Generates region-specific roadmap templates
 */

import { RegionConfig } from '../types';
import { BUSINESS_TYPE_GUIDANCE } from '../constants';

export function buildLegalPhase(regionConfig: RegionConfig, country: string): any {
  const templates: Record<string, any> = {
    'north_america_usa': {
      step_name: 'Incorporate Your Business',
      description: `
**Recommended Structure:** Delaware C-Corp (if seeking VC funding) or LLC (for lifestyle business).

**Steps:**
1. File Articles of Incorporation via Delaware Division of Corporations ($89-$129)
2. Apply for EIN (Federal Tax ID) via IRS.gov (Free, online, instant)
3. Draft Operating Agreement or Corporate Bylaws (Template: $0, Lawyer: $500-2000)
4. Register for state taxes if operating outside Delaware
5. Open business bank account (requires EIN + Articles)

**Timeline:** 1-2 weeks  
**Estimated Cost:** $500-$3,000 (DIY to full-service)
      `.trim(),
      estimated_cost: '$500-$3,000 USD',
      estimated_timeline: '1-2 weeks'
    },
    'africa_nigeria': {
      step_name: 'CAC Registration & Tax Setup',
      description: `
**Recommended Structure:** CAC Limited Company (if planning to scale) or Business Name (for solo/small).

**Steps:**
1. Reserve business name via CAC portal (₦500)
2. Complete CAC Form CAC 1.1 (Limited) or CAC BN 1 (Business Name)
3. Submit documents: ID, address proof, shareholding structure
4. Pay registration fee (₦10,000-₦50,000 depending on share capital)
5. Receive Certificate of Incorporation
6. Apply for TIN (Tax Identification Number) from FIRS (Free, online)
7. Open corporate bank account + Domiciliary Account (USD)

**Timeline:** 2-4 weeks (official), avoid "agents" promising 3 days  
**Estimated Cost:** ₦50,000-₦100,000 total
      `.trim(),
      estimated_cost: '₦50,000-₦100,000 NGN',
      estimated_timeline: '2-4 weeks'
    },
    'africa_kenya': {
      step_name: 'eCitizen Registration & KRA PIN',
      description: `
**Recommended Structure:** Limited Company (if planning to grow) or Business Name (for solo).

**Steps:**
1. Register via eCitizen portal (https://ecitizen.go.ke)
2. Reserve business name (KES 1,050)
3. Submit CR12 form for company registration
4. Pay registration fees (KES 10,500-30,000 depending on share capital)
5. Receive Certificate of Incorporation
6. Apply for KRA PIN (Tax ID) immediately (Free, online)
7. Open business bank account

**Timeline:** 7-14 days  
**Estimated Cost:** KES 10,000-30,000
      `.trim(),
      estimated_cost: 'KES 10,000-30,000',
      estimated_timeline: '7-14 days'
    },
    'caribbean_haiti': {
      step_name: 'Business Registration & Patente',
      description: `
**Recommended Structure:** SARL (Limited Company) for protection, or Sole Proprietorship for simplicity.

**Steps:**
1. Visit local commune office to begin registration process
2. Prepare business statutes (hire local lawyer recommended: $100-300)
3. Publish business formation in "Le Moniteur" (official gazette: $200-500)
4. Wait for publication confirmation (2-8 weeks)
5. Obtain "Patente" (business license) from commune ($50-200 annual)
6. Register with DGI (tax authority) for NIF (Tax ID)
7. Open business bank account (limited options, prepare for challenges)

**Timeline:** 3-6 months (this is realistic for Haiti)  
**Estimated Cost:** $500-$1,500 USD (or 30,000-90,000 HTG)
      `.trim(),
      estimated_cost: '$500-$1,500 USD',
      estimated_timeline: '3-6 months'
    },
    'latin_america_brazil': {
      step_name: 'CNPJ Registration & Accounting Setup',
      description: `
**Recommended Structure:** MEI (if revenue < R$ 81k/year) or LTDA (for higher revenue/multiple partners).

**Steps:**
1. If eligible, register as MEI via Portal do Empreendedor (Free, online, instant CNPJ)
2. If LTDA: Hire accountant (contador) FIRST - they will guide registration (R$ 300-800/month)
3. Draft Contrato Social (Corporate Agreement) via accountant
4. Register with Junta Comercial (State Commercial Registry: R$ 200-500)
5. Obtain CNPJ from Receita Federal (Federal Tax ID) via accountant
6. Register for municipal/state licenses (Alvará de Funcionamento)
7. Open business bank account (requires CNPJ + Contrato Social)
8. Enable Pix for business payments

**Timeline:** MEI: 1 day | LTDA: 2-4 weeks  
**Estimated Cost:** MEI: R$ 70/month | LTDA: R$ 2,000-10,000 setup + R$ 500-2,000/month accounting
      `.trim(),
      estimated_cost: 'MEI: R$ 70/month | LTDA: R$ 2,000-10,000',
      estimated_timeline: 'MEI: 1 day | LTDA: 2-4 weeks'
    },
    'latin_america_mexico': {
      step_name: 'RFC & Business Entity Formation',
      description: `
**Recommended Structure:** Persona Física (sole) or S.A. de C.V. / S. de R.L. de C.V. (corporate).

**Steps:**
1. Obtain RFC (tax ID) from SAT (Free, online or in-person)
2. Get FIEL (electronic signature) from SAT for invoicing
3. If corporate: Draft estatutos sociales (bylaws) with notary
4. Register with Public Registry of Commerce via notary
5. Set up CFDI invoicing system (mandatory for all transactions)
6. Register with IMSS (social security) if hiring employees
7. Open business bank account

**Timeline:** Persona Física: 1 week | Corporate: 3-6 weeks  
**Estimated Cost:** Persona Física: Free-$1,000 MXN | Corporate: $10,000-30,000 MXN
      `.trim(),
      estimated_cost: 'Persona Física: Free-$1,000 | Corporate: $10,000-30,000 MXN',
      estimated_timeline: 'Persona Física: 1 week | Corporate: 3-6 weeks'
    }
  };
  
  // Find matching template
  for (const [key, template] of Object.entries(templates)) {
    if (key.includes(country.toLowerCase()) || regionConfig.countries.some(c => key.includes(c.toLowerCase()))) {
      return template;
    }
  }
  
  return templates['north_america_usa']; // Fallback
}

export function buildInfrastructurePhase(regionConfig: RegionConfig, businessType: string): any {
  const typeGuidance = BUSINESS_TYPE_GUIDANCE[businessType.toLowerCase()] || BUSINESS_TYPE_GUIDANCE['saas'];
  
  const bankingList = regionConfig.banking_providers.slice(0, 3).join(', ');
  const paymentList = regionConfig.payment_processors.slice(0, 3).join(', ');
  
  return {
    step_name: 'Set Up Banking, Payments & Tech Stack',
    description: `
**Banking:** Open account with ${bankingList}
- Business checking account
- ${regionConfig.currency} account + USD account (if available)
- Online banking and mobile access

**Payment Processing:** Integrate ${paymentList}
- Set up merchant account
- Implement payment gateway API
- Test payment flows before launch
- ${regionConfig.region === 'Latin America' ? 'Enable Pix/local payment methods' : ''}
- ${regionConfig.region === 'Africa' ? 'Enable Mobile Money (M-Pesa/MTN/etc)' : ''}

**Tech Stack (${businessType}):** ${typeGuidance.infrastructure_focus}
- Cloud hosting: Vercel/Railway (simple) or AWS/GCP (scalable)
- Domain & email: Namecheap + Google Workspace
- CRM: HubSpot (free) or Airtable
- Communication: WhatsApp Business, Email

**Tools:**
- Accounting: QuickBooks/Wave (US) or local equivalent
- Project Management: Notion, Asana, or Trello
- Analytics: Google Analytics, Mixpanel, or Amplitude
    `.trim(),
    estimated_cost: `${regionConfig.currency} 500-5,000 (varies by business type)`,
    estimated_timeline: '1-3 weeks',
    resources: [
      'Cloud hosting provider',
      'Payment gateway',
      'CRM system',
      'Accounting software'
    ]
  };
}

export function buildLaunchPhase(regionConfig: RegionConfig, businessType: string): any {
  const typeGuidance = BUSINESS_TYPE_GUIDANCE[businessType.toLowerCase()] || BUSINESS_TYPE_GUIDANCE['saas'];
  
  const channelList = regionConfig.marketing_channels.slice(0, 4).join(', ');
  
  const isDevelopedMarket = ['North America', 'Europe'].includes(regionConfig.region);
  
  return {
    step_name: 'Launch & Customer Acquisition',
    description: `
**Go-to-Market Strategy (${businessType}):** ${typeGuidance.launch_strategy}

**Primary Channels for ${regionConfig.region}:**
${regionConfig.marketing_channels.map((ch, i) => `${i + 1}. ${ch}`).join('\n')}

${isDevelopedMarket ? `
**Digital-First Approach:**
- Build landing page with clear value proposition
- SEO optimization for local search
- Google Ads / Meta Ads campaigns (start with $500-1000/month)
- LinkedIn outreach for B2B
- Content marketing (blog, YouTube, podcast)
` : `
**Community-First Approach:**
- Join and contribute to WhatsApp/Telegram groups in your niche
- Partner with local influencers and community leaders
- Leverage offline channels (radio, posters, agents)
- Facebook & Instagram (optimized for slow internet)
- Word-of-mouth referral program (incentivize sharing)
`}

**Key Metrics to Track:** ${typeGuidance.key_metrics}

**Launch Checklist:**
- [ ] Test full user journey (signup → payment → delivery)
- [ ] Prepare customer support channel (WhatsApp/Email/Phone)
- [ ] Set up analytics tracking
- [ ] Create social media profiles
- [ ] Prepare launch content (announcement, demo, testimonials)
- [ ] Soft launch to 10-20 beta users
- [ ] Collect feedback and iterate
- [ ] Full public launch

**Budget:** Start with ${regionConfig.currency} 1,000-10,000 for first 3 months of marketing
    `.trim(),
    estimated_cost: `${regionConfig.currency} 1,000-10,000 (3 months)`,
    estimated_timeline: '2-4 weeks to launch, ongoing optimization',
    resources: [
      'Landing page',
      'Social media profiles',
      'Marketing budget',
      'Customer support system'
    ]
  };
}
