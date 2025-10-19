# Initial Setup Guide

Quick start guide to get "There Is Still Time" running locally.

## 1. Install Dependencies

```bash
# Install main app dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

## 2. Create `.env.local`

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Firebase credentials:

```env
# Get these from Firebase Console → Project Settings → General → Your apps → Web app
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD1234

# Phase feature flags (set to 'true' to enable)
NEXT_PUBLIC_ENABLE_PHASE_2=true
NEXT_PUBLIC_ENABLE_PHASE_3=false
NEXT_PUBLIC_ENABLE_PHASE_4=true
NEXT_PUBLIC_ENABLE_PHASE_5=false

# Optional: Video generation (for Phase 3)
REACT_APP_VIDEO_GEN_API_KEY=your-runway-api-key
REACT_APP_VIDEO_GEN_PROVIDER=runway
```

## 3. Add Placeholder Videos (Optional)

For local development, you can use placeholder videos or images:

**Option A: Create dummy video files**

```bash
# Create placeholder MP4 files (1 second black screen)
mkdir -p public/assets/hourglasses
ffmpeg -f lavfi -i color=c=black:s=1280x720:d=1 -pix_fmt yuv420p public/assets/hourglasses/zen-default.mp4
```

**Option B: Use online placeholder**

Update `constants/hourglassLibrary.ts` to use a placeholder URL:

```typescript
videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
```

**Option C: Skip videos temporarily**

Comment out the `<HourglassAnimation>` component in `app/page.tsx` for initial testing.

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
- "There Is Still Time" title
- Three session preset buttons (25/50/90 min)
- Clean dark UI with twilight colors

## 5. Test Basic Functionality

1. Click "25 min" button
2. Timer should start counting down
3. Progress ring should animate
4. Click "Pause" - timer pauses
5. Click "Resume" - timer continues
6. Click "End Session" - timer resets

## 6. Check Firestore (Optional)

If you want to test session tracking:

1. Start a session and let it complete (or click "End Session")
2. Go to Firebase Console → Firestore Database
3. You should see a new document in the `sessions` collection

## 7. Run Firebase Emulators (Recommended)

To test without affecting production:

```bash
firebase emulators:start
```

This starts:
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Hosting: http://localhost:5000
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

Update `.env.local` to point to emulators:

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
# (Firestore/Storage automatically detect emulators)
```

## Common Issues

### "Module not found" errors

```bash
rm -rf node_modules .next
npm install
```

### Firebase config errors

- Double-check `.env.local` values
- Ensure no trailing spaces
- Restart dev server after changes

### Videos not playing

- Check browser console for errors
- Try a different video URL
- Ensure autoplay is enabled in browser

### TypeScript errors

```bash
npm run build
```

This will show all TypeScript errors. Fix them one by one.

## Next Steps

- ✅ Read [README.md](README.md) for full feature documentation
- ✅ Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- ✅ Customize hourglass library in `constants/hourglassLibrary.ts`
- ✅ Add your own video assets

## Quick Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter

# Firebase
firebase login           # Login to Firebase
firebase init            # Initialize project
firebase deploy          # Deploy everything
firebase emulators:start # Run local emulators

# Functions
cd functions
npm run build            # Compile TypeScript
npm run serve            # Test functions locally
```

Happy coding! 🚀
