import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { getUserSubscription } from '@/lib/firebase/firestore';
import { getImageCredits } from '@/lib/subscription/tiers';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, userId, aspectRatio = '1:1' } = body;

    if (!prompt || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has credits remaining
    const subscription = await getUserSubscription(userId);
    const credits = getImageCredits(subscription);

    if (!credits.unlimited) {
      const creditsUsed = subscription?.imageCreditsUsed || 0;
      const creditsLimit = credits.monthly;

      if (creditsUsed >= creditsLimit) {
        return NextResponse.json(
          { error: 'Monthly image credit limit reached' },
          { status: 403 }
        );
      }
    }

    console.log('🎨 Generating image for user:', userId);
    console.log('📝 Prompt:', prompt);

    // Generate image using Replicate Flux Schnell (fast model)
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        num_outputs: 1,
        output_format: 'png',
        output_quality: 90,
      },
    });

    // Output is an array of image URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('✅ Image generated:', imageUrl);

    // TODO: Increment user's imageCreditsUsed in Firestore
    // This should be done in a separate function or Cloud Function

    return NextResponse.json({
      imageUrl,
      model: 'flux-schnell',
      creditsRemaining: credits.unlimited
        ? 'unlimited'
        : credits.monthly - (subscription?.imageCreditsUsed || 0) - 1,
    });
  } catch (error: any) {
    console.error('❌ Image generation error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Image generation failed',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
