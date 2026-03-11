/**
 * Roadmap Generation Constants
 * Region-specific configuration and templates
 */

import { RegionConfig } from './types';

export const REGION_CONFIGS: Record<string, RegionConfig> = {
  'north_america_usa': {
    region: 'North America',
    countries: ['USA', 'United States'],
    currency: 'USD',
    legal_structure: ['Delaware C-Corp', 'LLC', 'S-Corp'],
    banking_providers: ['Mercury', 'Brex', 'Chase', 'Silicon Valley Bank'],
    payment_processors: ['Stripe', 'Arc', 'Square', 'PayPal'],
    marketing_channels: ['SEO', 'Google Ads', 'LinkedIn', 'Content Marketing', 'Meta Ads'],
    common_warnings: [
      'Ensure you file for EIN immediately after incorporation',
      'Consider getting legal counsel for operating agreements',
      'Budget for state-specific taxes and fees'
    ]
  },
  'africa_nigeria': {
    region: 'Africa',
    countries: ['Nigeria', 'NG'],
    currency: 'NGN',
    legal_structure: ['CAC Registration (Business Name)', 'CAC Registration (Limited Company)', 'CAC Registration (Incorporated Trustees)'],
    banking_providers: ['GTBank', 'Access Bank', 'First Bank', 'Zenith Bank', 'Kuda'],
    payment_processors: ['Paystack', 'Flutterwave', 'Interswitch'],
    marketing_channels: ['WhatsApp Groups', 'Instagram', 'Facebook', 'Twitter', 'Radio', 'Offline Agents'],
    common_warnings: [
      'Budget NGN 50,000-100,000 for CAC registration',
      'Get TIN (Tax ID) from FIRS immediately',
      'Open a Corporate Domiciliary Account for USD transactions',
      'Do not pay bribes for CAC acceleration - official timeline is 2-4 weeks',
      'Budget for NEPC registration if exporting services'
    ]
  },
  'africa_kenya': {
    region: 'Africa',
    countries: ['Kenya', 'KE'],
    currency: 'KES',
    legal_structure: ['Limited Company', 'Business Name Registration', 'Partnership'],
    banking_providers: ['Equity Bank', 'KCB', 'Co-operative Bank', 'Safaricom M-Pesa'],
    payment_processors: ['M-Pesa', 'Paystack', 'Flutterwave', 'Stripe (via Atlas)'],
    marketing_channels: ['WhatsApp Groups', 'Facebook', 'Instagram', 'Radio', 'Matatu Adverts'],
    common_warnings: [
      'Register via eCitizen portal - takes 7-14 days',
      'Get KRA PIN immediately for tax purposes',
      'Budget KES 10,000-30,000 for registration',
      'M-Pesa is essential for local payments'
    ]
  },
  'caribbean_haiti': {
    region: 'Caribbean',
    countries: ['Haiti', 'HT'],
    currency: 'HTG/USD',
    legal_structure: ['SARL (Limited Company)', 'SA (Corporation)', 'Sole Proprietorship'],
    banking_providers: ['Unibank', 'Sogebank', 'Capital Bank'],
    payment_processors: ['MonCash', 'WiPay', 'PayPal (limited)', 'International Wire'],
    marketing_channels: ['WhatsApp', 'Facebook', 'Radio', 'Community Networks', 'Word of Mouth'],
    common_warnings: [
      'Business registration can take 3-6 months - plan accordingly',
      'You must publish in "Le Moniteur" (official gazette) - budget $200-500',
      'Get "Patente" (business license) from your local commune',
      'Banking infrastructure is limited - consider USD accounts',
      'Power and internet are unreliable - plan for offline operations'
    ]
  },
  'latin_america_brazil': {
    region: 'Latin America',
    countries: ['Brazil', 'BR'],
    currency: 'BRL',
    legal_structure: ['MEI (Micro Entrepreneur)', 'LTDA (Limited Company)', 'EIRELI', 'SA'],
    banking_providers: ['Nubank', 'Banco do Brasil', 'Itaú', 'Bradesco', 'Inter'],
    payment_processors: ['Mercado Pago', 'PagSeguro', 'Stripe', 'EBANX', 'Pix'],
    marketing_channels: ['Instagram', 'WhatsApp', 'Facebook', 'Google Ads', 'Influencer Marketing'],
    common_warnings: [
      'Get CNPJ immediately - you cannot operate without it',
      'Hire an accountant (contador) from day 1 - tax compliance is complex',
      'Consider MEI if revenue < R$ 81,000/year for simplified taxes',
      'Budget R$ 2,000-10,000 for registration and initial setup',
      'Pix is essential for local payments - enable immediately'
    ]
  },
  'latin_america_mexico': {
    region: 'Latin America',
    countries: ['Mexico', 'MX'],
    currency: 'MXN',
    legal_structure: ['Persona Física', 'S.A. de C.V.', 'S. de R.L. de C.V.'],
    banking_providers: ['BBVA', 'Santander', 'Banorte', 'Nu', 'Clip'],
    payment_processors: ['Mercado Pago', 'Conekta', 'Stripe', 'OpenPay'],
    marketing_channels: ['Facebook', 'Instagram', 'WhatsApp', 'TikTok', 'Google Ads'],
    common_warnings: [
      'Get RFC (tax ID) from SAT immediately',
      'Budget MXN 10,000-30,000 for registration',
      'Consider hiring a notary public for incorporation',
      'CFDI invoicing is mandatory - set up from day 1'
    ]
  }
};

export const BUSINESS_TYPE_GUIDANCE: Record<string, any> = {
  'saas': {
    infrastructure_focus: 'Cloud hosting, CI/CD, scalable database',
    launch_strategy: 'Product Hunt, Beta users, Content marketing',
    key_metrics: 'MRR, CAC, LTV, Churn'
  },
  'marketplace': {
    infrastructure_focus: 'Two-sided platform, Payment escrow, Ratings system',
    launch_strategy: 'Supply-side first, then demand generation',
    key_metrics: 'GMV, Take rate, Active sellers, Active buyers'
  },
  'ecommerce': {
    infrastructure_focus: 'Inventory management, Payment gateway, Shipping integration',
    launch_strategy: 'Social commerce, Influencer partnerships',
    key_metrics: 'AOV, Conversion rate, CAC, ROAS'
  },
  'local_service': {
    infrastructure_focus: 'Booking system, CRM, Local SEO',
    launch_strategy: 'Google My Business, Local partnerships, Referrals',
    key_metrics: 'Bookings, Repeat rate, NPS'
  },
  'consulting': {
    infrastructure_focus: 'Website, Calendly, Contracts, Invoicing',
    launch_strategy: 'LinkedIn, Speaking, Referrals, Content',
    key_metrics: 'Pipeline, Close rate, Average project value'
  },
  'coaching': {
    infrastructure_focus: 'Booking platform, Video calls, Payment processing',
    launch_strategy: 'Social proof, Free workshops, Referrals',
    key_metrics: 'Clients, Session rate, Retention'
  }
};

export const DEFAULT_WARNINGS = [
  'Do not launch without proper legal structure',
  'Budget at least 20% more than estimated costs for contingencies',
  'Validate payment acceptance before investing in marketing',
  'Start with minimum viable infrastructure, scale as needed'
];
