# FitLog MFE Deployment Guide

## Overview
This guide will help you deploy the FitLog Micro Frontend application to Netlify.

## Architecture
- **Shell App (fitlog-shell)**: Angular 19 - Main host application
- **Fasting Tracker MFE**: React 19 - Fasting tracking module
- **Streaks MFE**: Angular 19 - Streaks tracking module (Module Federation)
- **AI Insights MFE**: Angular 19 - AI insights module (Module Federation)

## Prerequisites
1. ✅ Netlify account with subscription
2. ✅ Git repositories for each app
3. ✅ Node.js 20+ installed locally

## Step 1: Create Git Repositories

### Option A: Separate Repositories (Recommended for MFE)
Create 4 separate repositories:
```bash
# 1. Shell App
cd fitlog-shell
git init
git add .
git commit -m "Initial commit: FitLog Shell App"
git remote add origin https://github.com/YOUR_USERNAME/fitlog-shell.git
git push -u origin main

# 2. Fasting Tracker
cd ../fitlog-fasting-tracker
git init
git add .
git commit -m "Initial commit: Fasting Tracker MFE"
git remote add origin https://github.com/YOUR_USERNAME/fitlog-fasting-tracker.git
git push -u origin main

# 3. Streaks (if exists)
cd ../fitlog-streaks
git init
git add .
git commit -m "Initial commit: Streaks MFE"
git remote add origin https://github.com/YOUR_USERNAME/fitlog-streaks.git
git push -u origin main

# 4. AI Insights (if exists)
cd ../fitlog-ai-insights
git init
git add .
git commit -m "Initial commit: AI Insights MFE"
git remote add origin https://github.com/YOUR_USERNAME/fitlog-ai-insights.git
git push -u origin main
```

### Option B: Monorepo
Create one repository with all apps:
```bash
cd Phase-1-FitLog-MFE
git init
git add .
git commit -m "Initial commit: FitLog MFE Monorepo"
git remote add origin https://github.com/YOUR_USERNAME/fitlog-mfe.git
git push -u origin main
```

## Step 2: Deploy to Netlify

### Deploy Each App Separately

#### 1. Deploy Fasting Tracker MFE
1. Go to Netlify Dashboard
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub/GitLab/Bitbucket)
4. Select `fitlog-fasting-tracker` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Site name**: `fitlog-fasting-tracker` (or your preferred name)
6. Click "Deploy site"
7. **Note the deployed URL** (e.g., `https://fitlog-fasting-tracker.netlify.app`)

#### 2. Deploy Streaks MFE (if exists)
1. Repeat same steps for streaks app
2. Build command: `npm run build`
3. Publish directory: `dist/fitlog-streaks/browser`
4. **Note the deployed URL** (e.g., `https://fitlog-streaks.netlify.app`)

#### 3. Deploy AI Insights MFE (if exists)
1. Repeat same steps for AI insights app
2. Build command: `npm run build`
3. Publish directory: `dist/fitlog-ai-insights/browser`
4. **Note the deployed URL** (e.g., `https://fitlog-ai-insights.netlify.app`)

#### 4. Deploy Shell App (Last)
1. Deploy shell app last after all MFEs are deployed
2. Build command: `npm run build`
3. Publish directory: `dist/fitlog-shell/browser`
4. **Note the deployed URL** (e.g., `https://fitlog-shell.netlify.app`)

## Step 3: Update Remote Entry URLs

After deployment, you need to update the remote entry URLs in the shell app to point to production URLs instead of localhost.

### Create Environment Configuration

Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  mfeUrls: {
    fastingTracker: 'https://fitlog-fasting-tracker.netlify.app',
    streaks: 'https://fitlog-streaks.netlify.app/remoteEntry.json',
    aiInsights: 'https://fitlog-ai-insights.netlify.app/remoteEntry.json'
  }
};
```

Create `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  mfeUrls: {
    fastingTracker: 'http://localhost:4206',
    streaks: 'http://localhost:4204/remoteEntry.json',
    aiInsights: 'http://localhost:4203/remoteEntry.json'
  }
};
```

## Step 4: Fix Remote Entry Issues

The streaks and AI insights apps are failing because they need to be built and deployed with Module Federation configuration.

### Check if MFEs exist:
```bash
# Check for streaks app
ls ../fitlog-streaks

# Check for AI insights app
ls ../fitlog-ai-insights
```

If they don't exist, you have two options:

**Option A**: Create placeholder MFEs
**Option B**: Remove them from the shell app temporarily

## Step 5: Redeploy Shell App

After updating environment configurations:
1. Commit changes to git
2. Push to repository
3. Netlify will auto-deploy
4. Or manually trigger deploy in Netlify dashboard

## Step 6: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed by Netlify

## Troubleshooting

### CORS Issues
- Ensure `netlify.toml` has CORS headers configured
- Check browser console for specific CORS errors

### Module Federation Errors
- Verify all MFEs are deployed and accessible
- Check remoteEntry.json URLs are correct
- Ensure CORS is enabled on all MFE deployments

### Build Failures
- Check build logs in Netlify
- Verify Node version is 20+
- Ensure all dependencies are in package.json

## Environment Variables

If you need environment-specific configs, add them in Netlify:
1. Site settings → Environment variables
2. Add variables like:
   - `NODE_VERSION=20`
   - `REACT_APP_API_URL=...`
   - `NG_APP_API_URL=...`

## Continuous Deployment

Once set up, Netlify will automatically deploy when you push to your main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Next Steps

1. Create Git repositories
2. Push code to GitHub/GitLab
3. Deploy each app to Netlify
4. Update remote entry URLs
5. Test production deployment
6. Configure custom domains (optional)
