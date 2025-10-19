'use client';

/**
 * AI Image Generation Service
 * Supports Replicate (Flux model) for custom hourglass images
 */

export interface ImageGenerationRequest {
  prompt: string;
  userId: string;
  aspectRatio?: '1:1' | '16:9' | '9:16';
  style?: 'photographic' | 'artistic' | 'minimalist' | 'abstract';
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  model: string;
  generatedAt: number;
}

// Default prompt template for hourglass images
const HOURGLASS_PROMPT_TEMPLATE = `
A mesmerizing hourglass timer in {STYLE} style with {DESCRIPTION}.
The hourglass should be elegant and calming, with flowing sand or particles.
Professional photography, high detail, 4k quality, centered composition.
{MOOD} atmosphere, perfect for a focus timer background.
`.trim();

/**
 * Enhance user prompt with hourglass-specific guidance
 */
export function enhanceHourglassPrompt(
  userPrompt: string,
  style: string = 'photographic'
): string {
  // Parse user intent
  const mood = userPrompt.toLowerCase().includes('calm')
    ? 'Peaceful and serene'
    : userPrompt.toLowerCase().includes('energetic')
    ? 'Vibrant and energizing'
    : userPrompt.toLowerCase().includes('dark')
    ? 'Moody and atmospheric'
    : 'Calm and focused';

  return HOURGLASS_PROMPT_TEMPLATE.replace('{STYLE}', style)
    .replace('{DESCRIPTION}', userPrompt)
    .replace('{MOOD}', mood);
}

/**
 * Generate image using Replicate API
 * This runs server-side via API route to keep API key secure
 */
export async function generateHourglassImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  try {
    // Enhance the prompt
    const enhancedPrompt = enhanceHourglassPrompt(
      request.prompt,
      request.style || 'photographic'
    );

    console.log('🎨 Generating image with prompt:', enhancedPrompt);

    // Call our API route (keeps API key server-side)
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        userId: request.userId,
        aspectRatio: request.aspectRatio || '1:1',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Image generation failed');
    }

    const result = await response.json();

    return {
      imageUrl: result.imageUrl,
      prompt: request.prompt,
      model: result.model || 'flux-schnell',
      generatedAt: Date.now(),
    };
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw error;
  }
}

/**
 * Get estimated generation time (for UI)
 */
export function getEstimatedGenerationTime(model: string = 'flux-schnell'): number {
  const times: Record<string, number> = {
    'flux-schnell': 10, // ~10 seconds
    'flux-dev': 30, // ~30 seconds
    'sdxl': 15, // ~15 seconds
  };

  return times[model] || 15;
}

/**
 * Validate user prompt
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length < 10) {
    return { valid: false, error: 'Prompt too short. Please be more descriptive (min 10 chars)' };
  }

  if (prompt.length > 500) {
    return { valid: false, error: 'Prompt too long. Please keep it under 500 characters' };
  }

  // Check for inappropriate content keywords
  const blockedWords = ['nsfw', 'explicit', 'nude', 'violent', 'gore'];
  const lowerPrompt = prompt.toLowerCase();

  for (const word of blockedWords) {
    if (lowerPrompt.includes(word)) {
      return { valid: false, error: 'Prompt contains inappropriate content' };
    }
  }

  return { valid: true };
}
