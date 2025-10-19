# Hourglass Video Assets

This directory contains the hourglass animation videos for "There Is Still Time".

## File Structure

```
hourglasses/
├── zen-default.mp4           # Default hourglass (always available)
├── breathe.mp4               # Unlocked after 3 sessions
├── study-mcat.mp4           # Unlocked after 3 sessions
├── focus-matters.mp4        # Unlocked after 3 sessions
├── remember-goals.mp4       # Unlocked after 3 sessions
├── new-beginnings.mp4       # Unlocked after 10 sessions
├── trust-process.mp4        # Unlocked after 10 sessions
├── be-present.mp4          # Unlocked after 10 sessions
├── galaxy.mp4              # Unlocked after 50 hours
├── ocean-waves.mp4         # Unlocked after 50 hours
├── aurora.mp4              # Unlocked after 100 hours
├── phoenix.mp4             # Unlocked after 100 hours
├── cosmic-love.mp4         # Premium only
├── inner-peace.mp4         # Premium only
└── thumbnails/
    ├── zen-default.jpg
    ├── breathe.jpg
    └── ... (thumbnails for all videos)
```

## Video Requirements

- **Format**: MP4 (H.264 codec)
- **Duration**: 5-10 seconds
- **Resolution**: 720p or 1080p
- **Frame Rate**: 30fps
- **Looping**: Videos should loop seamlessly (no black frames at start/end)
- **File Size**: < 5MB per video (for performance)

## Placeholder Videos

Until actual hourglass videos are created, you can:

1. Use simple placeholder videos (e.g., abstract animations, gradients)
2. Generate temporary videos using AI tools
3. Use royalty-free stock videos as placeholders

## Creating Hourglass Videos

### Using AI Generation

Use Runway ML, Gemini FX, or similar tools with prompts like:

- "A calming hourglass animation with flowing sand, peaceful, loopable"
- "Abstract hourglass representing clarity and focus, cinematic"
- "Cosmic hourglass with galaxy particles, serene, loopable"

### Video Optimization

After creating videos, optimize them:

```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M -crf 23 -r 30 output.mp4
```

## Firebase Storage Upload

Once videos are ready, upload them to Firebase Storage:

```bash
firebase deploy --only storage
```

Then update the URLs in `constants/hourglassLibrary.ts` with the Firebase Storage URLs.
