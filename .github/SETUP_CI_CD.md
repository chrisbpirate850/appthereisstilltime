# GitHub Actions CI/CD Setup

This repository is configured to automatically deploy to Firebase Hosting when you push to the `master` branch.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### How to Add Secrets:
1. Go to your GitHub repository: https://github.com/chrisbpirate850/appthereisstilltime
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Secrets to Add:

#### 1. FIREBASE_SERVICE_ACCOUNT
This is a service account key for Firebase deployment.

**To generate this:**
```bash
# In your local terminal (not Claude Code)
cd thereisstilltime/appthereisstilltime
firebase init hosting:github
```

This will:
- Create a service account automatically
- Add the secret to your GitHub repository
- Set up the workflow files

**OR manually create it:**
1. Go to Firebase Console: https://console.firebase.google.com/project/there-is-still-time/settings/serviceaccounts/adminsdk
2. Click **Generate new private key**
3. Download the JSON file
4. Copy the entire JSON content
5. Add it as a GitHub secret named `FIREBASE_SERVICE_ACCOUNT`

#### 2. Firebase Environment Variables
Copy these from your `.env.local` file:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions, no need to add it.

## Testing the Workflow

Once secrets are added:
1. Make any code change
2. Commit and push to master
3. Go to **Actions** tab in GitHub to watch the deployment
4. Your changes will automatically deploy to https://app.thereisstilltime.com

## Manual Deployment

If you need to deploy manually:
```bash
npm run build
firebase deploy --only hosting
```
