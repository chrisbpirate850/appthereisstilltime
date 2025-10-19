# Replicate AI Image Generation Setup

This app uses [Replicate](https://replicate.com) to generate custom hourglass images with AI.

## Setup Steps

### 1. Create a Replicate Account
1. Go to [replicate.com](https://replicate.com)
2. Sign up for a free account
3. You'll get free credits to start ($0.006 per image with Flux Schnell)

### 2. Get API Token
1. Go to [Account Settings](https://replicate.com/account/api-tokens)
2. Create a new API token
3. Copy the token (starts with `r8_`)

### 3. Add to Environment Variables
1. Copy `.env.local.example` to `.env.local` (if not already done)
2. Add your token:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

### 4. Test the Integration
1. Restart your dev server: `npm run dev`
2. Sign up/in to the app
3. Upgrade to Focus+ tier (or use test mode)
4. Click the AI hourglass button (✨ icon in header)
5. Enter a prompt and generate!

## Pricing

**Flux Schnell** (our model):
- ~$0.003 per image
- ~10 seconds generation time
- High quality, photorealistic results

**Free Tier:**
- $5 in free credits
- ~1,600 images

**Cost per User:**
- Focus+ (10 images/month): ~$0.03/user/month
- Student+ (unlimited): Variable, est. $0.30/user/month (100 images avg)

## Alternative APIs

If you prefer a different provider, you can swap out the API route:

### OpenAI DALL-E 3
- Update `app/api/generate-image/route.ts`
- Use OpenAI SDK
- Cost: $0.04/image (standard), $0.08/image (HD)

### Stability AI (SDXL)
- Similar to Replicate
- Cost: ~$0.004/image

## Monitoring Usage

Check your Replicate dashboard for:
- Total API calls
- Cost per day/month
- Model usage stats

## Troubleshooting

### Error: "No API token found"
- Make sure `REPLICATE_API_TOKEN` is in `.env.local`
- Restart dev server after adding

### Error: "Insufficient credits"
- Check your Replicate balance
- Add payment method or upgrade account

### Error: "Image generation failed"
- Check prompt content (must be appropriate)
- Try a shorter or simpler prompt
- Check Replicate status page

## Security Notes

- ✅ API token is server-side only (Next.js API route)
- ✅ Never exposed to client
- ✅ Prompt validation prevents abuse
- ✅ Credit limits per tier prevent runaway costs
