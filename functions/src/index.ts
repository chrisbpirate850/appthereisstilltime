import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// ============ Generate Custom Hourglass (Phase 3) ============
interface GenerateHourglassRequest {
  customPrompt: string;
  userId: string;
}

interface GenerateHourglassResponse {
  success: boolean;
  requestId?: string;
  videoUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export const generateCustomHourglass = functions.https.onCall(
  async (
    data: GenerateHourglassRequest,
    context
  ): Promise<GenerateHourglassResponse> => {
    // Validate authentication (optional in early phases)
    // const userId = context.auth?.uid;
    // if (!userId) {
    //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    // }

    const { customPrompt, userId } = data;

    // Validate input
    if (!customPrompt || customPrompt.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Custom prompt is required'
      );
    }

    if (customPrompt.length > 100) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Prompt must be 100 characters or less'
      );
    }

    try {
      // Create a request document in Firestore
      const requestRef = await admin
        .firestore()
        .collection('customHourglasses')
        .add({
          userId,
          customPrompt,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      const requestId = requestRef.id;

      // Get video generation provider from config
      const config = functions.config();
      const provider = config.video?.provider || 'runway';
      const apiKey = config.video?.apikey || process.env.REACT_APP_VIDEO_GEN_API_KEY;

      if (!apiKey) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Video generation API key not configured'
        );
      }

      // Update status to processing
      await requestRef.update({
        status: 'processing',
        processingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Call video generation API (async)
      // This is a placeholder - implement actual API call based on provider
      const videoGenerationResult = await callVideoGenerationAPI(
        provider,
        apiKey,
        customPrompt
      );

      if (!videoGenerationResult.success) {
        await requestRef.update({
          status: 'failed',
          errorMessage: videoGenerationResult.errorMessage,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: false,
          requestId,
          status: 'failed',
          errorMessage: videoGenerationResult.errorMessage,
        };
      }

      // If video generation is async, return processing status
      if (videoGenerationResult.taskId) {
        // Store task ID for polling
        await requestRef.update({
          taskId: videoGenerationResult.taskId,
        });

        return {
          success: true,
          requestId,
          status: 'processing',
        };
      }

      // If video is ready immediately, save to Storage
      if (videoGenerationResult.videoUrl) {
        // Update Firestore with completed status
        await requestRef.update({
          status: 'completed',
          videoUrl: videoGenerationResult.videoUrl,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Also update user's preferences to use the new custom hourglass
        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('preferences')
          .doc('main')
          .set(
            {
              customHourglassUrl: videoGenerationResult.videoUrl,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        return {
          success: true,
          requestId,
          videoUrl: videoGenerationResult.videoUrl,
          status: 'completed',
        };
      }

      // Fallback
      return {
        success: true,
        requestId,
        status: 'processing',
      };
    } catch (error) {
      console.error('Error generating custom hourglass:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate custom hourglass',
        error
      );
    }
  }
);

// ============ Video Generation API Caller ============
async function callVideoGenerationAPI(
  provider: string,
  apiKey: string,
  prompt: string
): Promise<{
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  errorMessage?: string;
}> {
  const enhancedPrompt = `A beautiful, calming hourglass animation symbolizing: ${prompt}. Cinematic, peaceful, loopable video with smooth transitions.`;

  switch (provider.toLowerCase()) {
    case 'runway':
      return await callRunwayAPI(apiKey, enhancedPrompt);

    case 'gemini':
      return await callGeminiAPI(apiKey, enhancedPrompt);

    case 'replicate':
      return await callReplicateAPI(apiKey, enhancedPrompt);

    default:
      return {
        success: false,
        errorMessage: `Unknown video generation provider: ${provider}`,
      };
  }
}

// ============ Provider-specific API Calls ============

async function callRunwayAPI(
  apiKey: string,
  prompt: string
): Promise<{
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  errorMessage?: string;
}> {
  try {
    const response = await fetch('https://api.runwayml.com/v1/gen2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: 8,
        resolution: '720p',
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `Runway API error: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Check if async
    if (data.taskId || data.id) {
      return {
        success: true,
        taskId: data.taskId || data.id,
      };
    }

    // Check if sync
    if (data.videoUrl || data.url) {
      return {
        success: true,
        videoUrl: data.videoUrl || data.url,
      };
    }

    return {
      success: false,
      errorMessage: 'Unexpected response from Runway API',
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function callGeminiAPI(
  apiKey: string,
  prompt: string
): Promise<{
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  errorMessage?: string;
}> {
  // TODO: Implement Gemini FX API
  return {
    success: false,
    errorMessage: 'Gemini provider not yet implemented',
  };
}

async function callReplicateAPI(
  apiKey: string,
  prompt: string
): Promise<{
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  errorMessage?: string;
}> {
  // TODO: Implement Replicate API
  return {
    success: false,
    errorMessage: 'Replicate provider not yet implemented',
  };
}

// ============ Check Video Generation Status ============
export const checkGenerationStatus = functions.https.onCall(
  async (data: { requestId: string }, context) => {
    const { requestId } = data;

    if (!requestId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Request ID is required'
      );
    }

    try {
      const requestDoc = await admin
        .firestore()
        .collection('customHourglasses')
        .doc(requestId)
        .get();

      if (!requestDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Request not found');
      }

      const requestData = requestDoc.data();

      return {
        status: requestData?.status || 'unknown',
        videoUrl: requestData?.videoUrl,
        errorMessage: requestData?.errorMessage,
      };
    } catch (error) {
      console.error('Error checking generation status:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to check status',
        error
      );
    }
  }
);

// ============ Stripe Webhook Handler (Phase 5) ============
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // TODO: Implement Stripe webhook handler for subscription events
  // This will update user subscription status in Firestore

  res.status(200).send('OK');
});
