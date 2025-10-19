# There Is Still Time - Focus Timer App

A minimalist symbolic focus timer designed for serious exam prep students. Built with Next.js, TypeScript, and Firebase.

## 🌟 Features

### Phase 1 - MVP (Core Timer)
- ✅ One-tap preset session durations (25/50/90 min + custom)
- ✅ Accurate countdown timer with drift compensation
- ✅ Circular progress ring animation
- ✅ Looping hourglass video background
- ✅ Session tracking (total sessions, total hours)
- ✅ Milestone celebrations (non-gamified)
- ✅ Reduced motion support

### Phase 2 - Symbolic Mapping
- ✅ Curated hourglass library (10+ symbolic animations)
- ✅ "There is still time to..." prompt selector
- ✅ Theme-based grouping (Zen, Dusk, Midnight)
- ✅ Progressive unlocks based on session count/hours

### Phase 3 - AI Personalization
- ✅ Custom hourglass generation via AI (Runway ML, Gemini, etc.)
- ✅ Swappable video generation provider
- ✅ Firebase Cloud Function integration
- ✅ Async generation with status tracking

### Phase 4 - Meaningful Progression
- ✅ Milestone affirmations (10/50/100 sessions, 50/100/250 hours)
- ✅ Optional journaling after sessions
- ✅ Guided journaling themes (Premium)
- ✅ Evolving hourglass visuals

### Phase 5 - Premium & Expansion
- ✅ Stripe subscription integration (planned)
- ✅ Premium tier ($4.99/month)
- ✅ Cross-device sync (Firebase Auth)
- ✅ Ambient theme modes
- ⏳ Calendar sync, data export (coming soon)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- (Optional) Video generation API key (Runway ML, Gemini, etc.)

### Installation

1. **Clone and install dependencies**

```bash
cd appthereisstilltime
npm install
cd functions
npm install
cd ..
```

2. **Set up Firebase**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
# Select: Hosting, Firestore, Functions, Storage
# Choose existing project or create new one
```

3. **Configure environment variables**

Create `.env.local` in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Video Generation API (Optional - for Phase 3)
REACT_APP_VIDEO_GEN_API_KEY=your-api-key
REACT_APP_VIDEO_GEN_PROVIDER=runway

# Feature Flags (set to 'true' to enable phases)
NEXT_PUBLIC_ENABLE_PHASE_2=true
NEXT_PUBLIC_ENABLE_PHASE_3=false
NEXT_PUBLIC_ENABLE_PHASE_4=true
NEXT_PUBLIC_ENABLE_PHASE_5=false

# Stripe (Phase 5)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

4. **Configure Firebase Functions environment**

```bash
firebase functions:config:set video.provider="runway"
firebase functions:config:set video.apikey="your-runway-api-key"
```

5. **Add hourglass video assets**

Place your MP4 hourglass videos in:
```
public/assets/hourglasses/
├── zen-default.mp4
├── breathe.mp4
├── study-mcat.mp4
└── ... (see public/assets/hourglasses/README.md)
```

Or update URLs in `constants/hourglassLibrary.ts` to point to Firebase Storage.

## 📦 Development

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run with Firebase Emulators

```bash
firebase emulators:start
```

This starts local emulators for Firestore, Functions, Storage, and Hosting.

### Build for production

```bash
npm run build
```

This creates an optimized static export in the `out/` directory.

## 🚢 Deployment

### Deploy to Firebase Hosting

1. **Build the app**

```bash
npm run build
```

2. **Deploy to Firebase**

```bash
firebase deploy
```

This deploys:
- Static site to Firebase Hosting
- Cloud Functions
- Firestore security rules
- Storage security rules

3. **Set up custom domain**

In Firebase Console:
- Go to Hosting
- Add custom domain: `app.thereisstilltime.com`
- Follow DNS configuration instructions

### Deploy only specific services

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

## 📁 Project Structure

```
appthereisstilltime/
├── app/
│   ├── page.tsx              # Main timer page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Timer/
│   │   ├── ProgressRing.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── SessionPresets.tsx
│   │   └── HourglassAnimation.tsx
│   ├── Personalization/
│   │   ├── HourglassSelector.tsx
│   │   └── CustomHourglassModal.tsx
│   └── Progression/
│       ├── MilestoneToast.tsx
│       └── ReflectionModal.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts         # Firebase initialization
│   │   ├── firestore.ts      # Firestore helpers
│   │   └── analytics.ts      # Analytics helpers
│   ├── hooks/
│   │   ├── useTimer.ts       # Core timer logic
│   │   ├── useSessionTracking.ts
│   │   ├── useHourglassLibrary.ts
│   │   └── usePreferences.ts
│   ├── services/
│   │   └── videoGeneration.ts # AI video generation
│   └── utils/
│       ├── userId.ts
│       └── featureFlags.ts
├── constants/
│   └── hourglassLibrary.ts   # Hourglass configs & milestones
├── types/
│   └── index.ts              # TypeScript interfaces
├── functions/
│   └── src/
│       └── index.ts          # Cloud Functions
├── public/
│   ├── assets/
│   │   └── hourglasses/      # Video files
│   └── sounds/               # Audio files
├── firebase.json             # Firebase config
├── firestore.rules           # Firestore security
├── storage.rules             # Storage security
└── package.json
```

## 🎨 Customization

### Adding New Hourglasses

1. Add video file to `public/assets/hourglasses/`
2. Add entry to `constants/hourglassLibrary.ts`:

```typescript
{
  id: 'my-hourglass',
  promptKey: 'my_prompt',
  promptText: 'achieve my goals',
  symbolism: 'determination',
  videoUrl: '/assets/hourglasses/my-hourglass.mp4',
  theme: 'zen',
  unlockRequirement: {
    type: 'sessions',
    value: 5,
  },
}
```

### Changing Theme Colors

Edit `tailwind.config.ts` to customize the twilight/plum/gold color palettes.

### Adjusting Milestones

Edit `MILESTONES` array in `constants/hourglassLibrary.ts`.

## 🔐 Security

- **Firestore Rules**: Users can only read/write their own data
- **Storage Rules**: Custom videos are user-scoped
- **API Keys**: Stored in environment variables, not in client code
- **Cloud Functions**: Validate all inputs, check authentication

## 📊 Analytics

The app tracks:
- `session_started`
- `session_completed`
- `milestone_reached`
- `hourglass_changed`
- `custom_hourglass_requested`
- `reflection_submitted`

View analytics in Firebase Console.

## 🎯 Roadmap

- [ ] Settings panel (theme switcher, animation toggle)
- [ ] Ambient soundtrack (Phase 5)
- [ ] Calendar sync (Phase 5)
- [ ] Data export (CSV/JSON)
- [ ] PWA with offline support
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Videos not loading

- Check that video files exist in `public/assets/hourglasses/`
- Verify URLs in `constants/hourglassLibrary.ts`
- Check browser console for CORS errors

### Firebase errors

- Ensure `.env.local` is configured correctly
- Run `firebase login` to authenticate
- Check Firestore/Storage rules are deployed

### Timer accuracy issues

- The timer uses `Date.now()` for drift compensation
- Check browser's visibility API support
- Test in different browsers

## 📝 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📧 Support

For issues or questions, please contact [your-email@example.com]

---

**Built with ❤️ for focused students everywhere**
