/**
 * Roadmap Generation Tests
 * Examples and test cases for the Localized Roadmap Architect
 */

import { generateRoadmap } from '../index';
import { getRegionConfig } from '../engine/regionMapper';

// Test Case 1: Nigerian Marketplace
async function testNigerianMarketplace() {
  console.log('\n=== Test: Nigerian Marketplace ===\n');
  
  const roadmap = await generateRoadmap({
    idea: 'A marketplace connecting local artisans with customers in Lagos',
    region: 'Africa',
    country: 'Nigeria',
    businessType: 'marketplace',
    validationData: {
      score: 75,
      risks: [
        { risk: 'Payment infrastructure challenges', severity: 'medium' },
        { risk: 'Trust and safety concerns', severity: 'high' }
      ]
    }
  });
  
  console.log('Country:', 'Nigeria');
  console.log('Business Type:', 'Marketplace');
  console.log('\nPhase 1 - Legal:');
  console.log('  Step:', roadmap.phase_1_legal.step_name);
  console.log('  Cost:', roadmap.phase_1_legal.estimated_cost);
  console.log('  Timeline:', roadmap.phase_1_legal.estimated_timeline);
  
  console.log('\nPhase 2 - Infrastructure:');
  console.log('  Step:', roadmap.phase_2_infrastructure.step_name);
  
  console.log('\nPhase 3 - Launch:');
  console.log('  Step:', roadmap.phase_3_launch.step_name);
  
  console.log('\nWarnings:', roadmap.warnings.length);
  console.log('First 3 warnings:');
  roadmap.warnings.slice(0, 3).forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

// Test Case 2: US SaaS
async function testUSSaaS() {
  console.log('\n=== Test: US SaaS ===\n');
  
  const roadmap = await generateRoadmap({
    idea: 'An AI-powered scheduling tool for small businesses',
    region: 'North America',
    country: 'USA',
    businessType: 'saas'
  });
  
  console.log('Country:', 'USA');
  console.log('Business Type:', 'SaaS');
  console.log('\nPhase 1 Cost:', roadmap.phase_1_legal.estimated_cost);
  console.log('Phase 1 Timeline:', roadmap.phase_1_legal.estimated_timeline);
  console.log('\nLegal Structure Options:');
  const config = getRegionConfig('USA');
  console.log('  -', config.legal_structure.join('\n  - '));
}

// Test Case 3: Kenyan Local Service
async function testKenyanService() {
  console.log('\n=== Test: Kenyan Local Service ===\n');
  
  const roadmap = await generateRoadmap({
    idea: 'Home cleaning service in Nairobi',
    region: 'Africa',
    country: 'Kenya',
    businessType: 'local_service'
  });
  
  console.log('Country:', 'Kenya');
  console.log('Business Type:', 'Local Service');
  console.log('\nMarketing Channels:');
  const config = getRegionConfig('Kenya');
  config.marketing_channels.forEach((ch: string) => console.log(`  - ${ch}`));
  
  console.log('\nPayment Processors:');
  config.payment_processors.forEach((pp: string) => console.log(`  - ${pp}`));
}

// Test Case 4: Haitian Business (Long Timeline)
async function testHaitianBusiness() {
  console.log('\n=== Test: Haitian Business ===\n');
  
  const roadmap = await generateRoadmap({
    idea: 'An e-commerce store for local products',
    region: 'Caribbean',
    country: 'Haiti',
    businessType: 'ecommerce'
  });
  
  console.log('Country:', 'Haiti');
  console.log('Business Type:', 'E-commerce');
  console.log('\nPhase 1 Timeline:', roadmap.phase_1_legal.estimated_timeline);
  console.log('Note: Haiti has longer registration timelines');
  
  console.log('\nKey Warnings for Haiti:');
  roadmap.warnings
    .filter((w: string) => w.toLowerCase().includes('haiti') || w.toLowerCase().includes('moniteur') || w.toLowerCase().includes('patente'))
    .forEach((w: string) => console.log(`  - ${w}`));
}

// Test Case 5: Brazilian MEI vs LTDA
async function testBrazilianBusiness() {
  console.log('\n=== Test: Brazilian Business ===\n');
  
  const roadmap = await generateRoadmap({
    idea: 'A coaching practice for entrepreneurs',
    region: 'Latin America',
    country: 'Brazil',
    businessType: 'coaching'
  });
  
  console.log('Country:', 'Brazil');
  console.log('Business Type:', 'Coaching');
  console.log('\nLegal Options (MEI vs LTDA):');
  console.log(roadmap.phase_1_legal.description.substring(0, 300) + '...');
  
  console.log('\nCurrency:', 'BRL');
  console.log('Phase 1 Cost:', roadmap.phase_1_legal.estimated_cost);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Roadmap Generation Tests...\n');
  
  try {
    await testNigerianMarketplace();
    await testUSSaaS();
    await testKenyanService();
    await testHaitianBusiness();
    await testBrazilianBusiness();
    
    console.log('\n✅ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Export for use in other files
export {
  testNigerianMarketplace,
  testUSSaaS,
  testKenyanService,
  testHaitianBusiness,
  testBrazilianBusiness,
  runAllTests
};

// Run if executed directly
if (require.main === module) {
  runAllTests();
}
