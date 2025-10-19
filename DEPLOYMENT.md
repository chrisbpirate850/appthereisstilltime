# Deployment Guide for "There Is Still Time"

This guide walks through deploying the app to Firebase Hosting at `app.thereisstilltime.com`.

## Prerequisites

- ✅ Firebase CLI installed: `npm install -g firebase-tools`
- ✅ Firebase project created
- ✅ Domain `thereisstilltime.com` registered and DNS accessible
- ✅ All environment variables configured

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: `thereisstilltime` (or your choice)
4. Enable Google Analytics (optional)
5. Create project

### 1.2 Enable Services

In Firebase Console, enable:

- **Authentication** (Settings → Sign-in method)
  - Enable Anonymous (for Phase 1)
  - Enable Email/Password (for Phase 5)
  - Enable Google (optional)

- **Firestore Database**
  - Start in production mode
  - Choose region (e.g., us-central1)

- **Storage**
  - Start in production mode
  - Same region as Firestore

- **Functions**
  - Upgrade to Blaze plan (pay-as-you-go) if using external APIs

### 1.3 Get Firebase Config

1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Click "Add app" (web icon)
4. Register app: `there-is-still-time`
5. Copy the config object

### 1.4 Update `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=thereisstilltime.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=thereisstilltime
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=thereisstilltime.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD1234
```

## Step 2: Upload Hourglass Videos to Firebase Storage

### 2.1 Organize Videos Locally

Ensure videos are in `public/assets/hourglasses/`:
```
zen-default.mp4
breathe.mp4
study-mcat.mp4
... (all 14 videos)
```

### 2.2 Upload to Firebase Storage

Using Firebase Console:

1. Go to Storage in Firebase Console
2. Create folder: `/hourglasses`
3. Upload all MP4 files
4. Create folder: `/thumbnails`
5. Upload thumbnail images

Or using Firebase CLI:

```bash
# Install gsutil (if not already)
# Then upload
gsutil -m cp -r public/assets/hourglasses/* gs://your-bucket-name/hourglasses/
```

### 2.3 Update Video URLs

Option A: Use Firebase Storage URLs

1. Get each video's download URL from Storage console
2. Update `constants/hourglassLibrary.ts`:

```typescript
videoUrl: 'https://firebasestorage.googleapis.com/.../zen-default.mp4'
```

Option B: Keep local URLs (simpler for Phase 1)

Videos will be served from the static export.

## Step 3: Configure Firebase Hosting

### 3.1 Initialize Firebase

```bash
cd appthereisstilltime
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage

Follow prompts:
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Functions language: TypeScript
- Hosting public directory: `out`
- Configure as single-page app: Yes
- Set up automatic builds: No

### 3.2 Update `firebase.json`

Already configured in the repo. Verify:

```json
{
  "hosting": {
    "public": "out",
    "site": "app-thereisstilltime",
    ...
  }
}
```

## Step 4: Build and Deploy

### 4.1 Build the App

```bash
npm install
npm run build
```

This creates the `out/` directory with the static export.

### 4.2 Deploy to Firebase

```bash
firebase deploy
```

This deploys:
- Static site → Firebase Hosting
- Cloud Functions → Firebase Functions
- Security rules → Firestore & Storage

### 4.3 Verify Deployment

Open the Firebase-provided URL (e.g., `https://thereisstilltime.web.app`)

Test:
- Timer starts and counts down
- Sessions are saved to Firestore
- Videos play (if using local assets)

## Step 5: Set Up Custom Domain

### 5.1 Add Domain in Firebase

1. Go to Hosting in Firebase Console
2. Click "Add custom domain"
3. Enter: `app.thereisstilltime.com`
4. Follow verification steps

### 5.2 Configure DNS

Add these records to your domain provider (e.g., Namecheap, GoDaddy):

**For subdomain `app.thereisstilltime.com`:**

| Type | Name | Value |
|------|------|-------|
| A | app | 151.101.1.195 |
| A | app | 151.101.65.195 |

Or use the specific IPs provided by Firebase.

**Alternative: CNAME (if supported)**

| Type | Name | Value |
|------|------|-------|
| CNAME | app | thereisstilltime.web.app |

### 5.3 Wait for SSL Provisioning

- DNS propagation: 5 minutes - 24 hours
- SSL certificate: Up to 24 hours

Once complete, your app will be live at `https://app.thereisstilltime.com`

## Step 6: Configure Cloud Functions Environment

### 6.1 Set Video Generation API Key

```bash
firebase functions:config:set video.provider="runway"
firebase functions:config:set video.apikey="sk_runway_..."
```

### 6.2 Set Stripe Keys (Phase 5)

```bash
firebase functions:config:set stripe.secret="sk_live_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

### 6.3 Redeploy Functions

```bash
firebase deploy --only functions
```

## Step 7: Feature Flags for Phased Rollout

Control which phases are live via environment variables:

### For Development

In `.env.local`:
```env
NEXT_PUBLIC_ENABLE_PHASE_2=true
NEXT_PUBLIC_ENABLE_PHASE_3=false  # Keep disabled until AI API ready
NEXT_PUBLIC_ENABLE_PHASE_4=true
NEXT_PUBLIC_ENABLE_PHASE_5=false  # Enable when Stripe is configured
```

### For Production

Update environment in Firebase Hosting settings or rebuild with production `.env`:

```bash
# Build with production env
npm run build

# Deploy
firebase deploy --only hosting
```

## Step 8: Monitoring & Analytics

### 8.1 Firebase Analytics

- Already integrated via `lib/firebase/analytics.ts`
- View data in Firebase Console → Analytics

### 8.2 Performance Monitoring

Install Performance Monitoring SDK (optional):

```bash
npm install firebase/performance
```

### 8.3 Error Tracking

Consider adding Sentry:

```bash
npm install @sentry/nextjs
```

## Rollout Strategy

### Phase 1 Launch (MVP)
- ✅ Core timer functionality
- ✅ Session tracking
- ✅ Default hourglass
- Deploy with: `ENABLE_PHASE_2=false`

### Phase 2 Rollout (Symbolic Library)
- After user testing Phase 1
- Upload all hourglass videos
- Set: `ENABLE_PHASE_2=true`
- Redeploy

### Phase 3 Rollout (AI Custom)
- Configure Runway ML API key
- Test thoroughly in staging
- Set: `ENABLE_PHASE_3=true` (for premium users only)
- Monitor costs closely

### Phase 4 & 5 Rollout
- Enable journaling when ready
- Launch premium tier with Stripe integration

## Maintenance

### Update Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Update Storage Rules

```bash
firebase deploy --only storage
```

### Update Functions Only

```bash
firebase deploy --only functions
```

### View Logs

```bash
firebase functions:log
```

### Rollback

If issues arise:

```bash
firebase hosting:rollback
```

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next out node_modules
npm install
npm run build
```

### Deployment Fails

- Check Firebase CLI version: `firebase --version`
- Update: `npm install -g firebase-tools@latest`
- Re-login: `firebase logout && firebase login`

### Domain Not Working

- Check DNS propagation: `nslookup app.thereisstilltime.com`
- Wait 24 hours for SSL
- Check Firebase Console for status

### Functions Timeout

- Increase timeout in `functions/src/index.ts`:
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onCall(...)
```

## Cost Estimates

**Firebase (Blaze Plan):**
- Hosting: ~$0 (1GB free)
- Firestore: ~$1-5/month (small usage)
- Functions: ~$5-20/month (depending on AI generation frequency)
- Storage: ~$0.026/GB/month

**External APIs:**
- Runway ML: ~$0.05-0.10 per video generation
- Stripe: 2.9% + $0.30 per transaction

**Estimated total for 1000 users/month:** $20-50

---

🎉 **Your app is now live at app.thereisstilltime.com!**
