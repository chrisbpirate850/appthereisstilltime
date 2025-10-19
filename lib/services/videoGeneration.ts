/**
 * Video Generation Service Abstraction Layer
 * Supports multiple providers: Runway ML, Gemini FX, Replicate, Stable Diffusion
 * Provider is selected via environment variable REACT_APP_VIDEO_GEN_PROVIDER
 */

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number; // in seconds, default 5-10
  resolution?: '720p' | '1080p';
  userId: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  taskId?: string; // For async providers
  status: 'completed' | 'processing' | 'failed';
  errorMessage?: string;
}

export interface VideoGenerationProvider {
  name: string;
  generateVideo: (request: VideoGenerationRequest) => Promise<VideoGenerationResponse>;
  checkStatus?: (taskId: string) => Promise<VideoGenerationResponse>;
}

// ============ Runway ML Gen-2 Provider ============
class RunwayProvider implements VideoGenerationProvider {
  name = 'Runway ML Gen-2';
  private apiKey: string;
  private endpoint = 'https://api.runwayml.com/v1/gen2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    try {
      // Enhance prompt for hourglass context
      const enhancedPrompt = `A beautiful, calming hourglass animation symbolizing: ${request.prompt}. Cinematic, peaceful, loopable video with smooth transitions.`;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          duration: request.duration || 5,
          resolution: request.resolution || '720p',
        }),
      });

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.statusText}`);
      }

      const data = await response.json();

      // If async, return task ID
      if (data.taskId) {
        return {
          success: true,
          taskId: data.taskId,
          status: 'processing',
        };
      }

      // If sync, return video URL
      return {
        success: true,
        videoUrl: data.videoUrl || data.url,
        status: 'completed',
      };
    } catch (error) {
      console.error('Runway generation error:', error);
      return {
        success: false,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkStatus(taskId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.endpoint}/status/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          success: true,
          videoUrl: data.videoUrl || data.url,
          status: 'completed',
        };
      }

      return {
        success: true,
        status: 'processing',
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============ Gemini FX Provider (Placeholder) ============
class GeminiProvider implements VideoGenerationProvider {
  name = 'Gemini FX';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    // TODO: Implement Gemini FX API integration
    console.log('Gemini FX generation:', request);

    return {
      success: false,
      status: 'failed',
      errorMessage: 'Gemini FX provider not yet implemented',
    };
  }
}

// ============ Replicate Provider (Placeholder) ============
class ReplicateProvider implements VideoGenerationProvider {
  name = 'Replicate';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    // TODO: Implement Replicate API integration
    console.log('Replicate generation:', request);

    return {
      success: false,
      status: 'failed',
      errorMessage: 'Replicate provider not yet implemented',
    };
  }
}

// ============ Stable Diffusion Provider (Fallback) ============
class StableDiffusionProvider implements VideoGenerationProvider {
  name = 'Stable Diffusion Video';

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    // TODO: Implement Stable Diffusion Video generation
    console.log('Stable Diffusion generation:', request);

    return {
      success: false,
      status: 'failed',
      errorMessage: 'Stable Diffusion provider not yet implemented',
    };
  }
}

// ============ Provider Factory ============
export function getVideoGenerationProvider(): VideoGenerationProvider {
  const providerName =
    process.env.REACT_APP_VIDEO_GEN_PROVIDER || 'runway';
  const apiKey = process.env.REACT_APP_VIDEO_GEN_API_KEY || '';

  switch (providerName.toLowerCase()) {
    case 'runway':
      return new RunwayProvider(apiKey);
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'replicate':
      return new ReplicateProvider(apiKey);
    case 'stable-diffusion':
      return new StableDiffusionProvider();
    default:
      console.warn(`Unknown provider: ${providerName}, defaulting to Runway`);
      return new RunwayProvider(apiKey);
  }
}

// ============ Main Generation Function ============
export async function generateCustomHourglass(
  prompt: string,
  userId: string
): Promise<VideoGenerationResponse> {
  const provider = getVideoGenerationProvider();

  console.log(`Generating video with provider: ${provider.name}`);

  return provider.generateVideo({
    prompt,
    userId,
    duration: 8, // 8 second loop
    resolution: '720p',
  });
}

export async function checkGenerationStatus(
  taskId: string
): Promise<VideoGenerationResponse> {
  const provider = getVideoGenerationProvider();

  if (!provider.checkStatus) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'Provider does not support status checking',
    };
  }

  return provider.checkStatus(taskId);
}
