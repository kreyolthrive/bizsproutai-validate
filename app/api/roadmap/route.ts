/**
 * Roadmap Generation API Route
 * POST /api/roadmap - Generate a localized build plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRoadmap } from '@/src/roadmap';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { idea, region, country, businessType, validationData, sprintSettings } = body;
    
    // Validate required fields
    if (!idea || !country || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, country, businessType' },
        { status: 400 }
      );
    }
    
    // Generate roadmap
    const roadmap = await generateRoadmap({
      idea,
      region: region || country,
      country,
      businessType,
      validationData,
      sprintSettings,
    });
    
    return NextResponse.json({
      success: true,
      roadmap
    });
    
  } catch (error) {
    console.error('Roadmap generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Roadmap API - Use POST to generate a build plan',
    version: '1.0.0',
    supported_countries: ['USA', 'Nigeria', 'Kenya', 'Haiti', 'Brazil', 'Mexico'],
    required_fields: ['idea', 'country', 'businessType'],
    optional_fields: ['sprintSettings.sprintTemplateId', 'sprintSettings.sprintIntensity']
  });
}
