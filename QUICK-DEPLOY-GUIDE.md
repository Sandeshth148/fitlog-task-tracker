# 🚀 Quick Deploy Guide - FitLog MFE

**Goal:** Push all code to GitHub and deploy for FREE

---

## ✅ Step 1: Push Streaks to GitHub (5 minutes)

### **A. Create GitHub Repository**

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `fitlog-streaks`
   - **Description:** `FitLog Streaks MFE - Daily habit tracking with gamification`
   - **Visibility:** Public
   - **DO NOT** check "Initialize with README" (we have code)
3. Click "Create repository"

### **B. Push Code**

Open terminal in `fitlog-streaks` folder and run:

```bash
cd fitlog-streaks
git remote add origin https://github.com/Sandeshth148/fitlog-streaks.git
git branch -M main
git push -u origin main
```

**Done!** ✅ Streaks is now on GitHub

---

## ✅ Step 2: Deploy Shell to Netlify (10 minutes)

### **Option A: Netlify (Recommended - Easiest)**

#### **1. Sign Up**
- Go to: https://app.netlify.com/signup
- Click "Sign up with GitHub"
- Authorize Netlify

#### **2. Deploy**
1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select `fitlog-shell` repository
4. Build settings (auto-detected):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/fitlog-shell/browser`
   - **Node version:** 20 (set in Environment variables if needed)
5. Click "Deploy site"

#### **3. Wait & Get URL**
- Wait 2-3 minutes for build
- You'll get a URL like: `https://random-name-123.netlify.app`
- Click on it to test!

#### **4. (Optional) Custom Subdomain**
- Go to Site settings → Domain management
- Click "Options" → "Edit site name"
- Change to: `fitlog-app` (if available)
- New URL: `https://fitlog-app.netlify.app`

**Cost:** FREE ✅

---

### **Option B: Vercel (Alternative)**

#### **1. Sign Up**
- Go to: https://vercel.com/signup
- Sign up with GitHub

#### **2. Deploy**
1. Click "Add New" → "Project"
2. Import `fitlog-shell` from GitHub
3. Vercel auto-detects Angular
4. Click "Deploy"

#### **3. Get URL**
- URL: `https://fitlog-shell.vercel.app`

**Cost:** FREE ✅

---

### **Option C: Cloudflare Pages (Unlimited Bandwidth)**

#### **1. Sign Up**
- Go to: https://dash.cloudflare.com/sign-up
- Create account

#### **2. Deploy**
1. Go to "Pages" → "Create a project"
2. Connect to GitHub
3. Select `fitlog-shell`
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist/fitlog-shell/browser`
5. Click "Save and Deploy"

#### **3. Get URL**
- URL: `https://fitlog-shell.pages.dev`

**Cost:** FREE (unlimited bandwidth!) ✅

---

## 🎯 What Will Work After Deployment?

### **✅ Will Work:**
- Weight Tracker (local in Shell)
- Trends/Charts
- Multi-language support
- IndexedDB storage
- All Shell features

### **⚠️ Won't Work (Expected):**
- Streaks MFE (needs localhost:4204)
- This is normal for now!

### **Why?**
The federation manifest points to `localhost:4204` for Streaks. We'll fix this later when we deploy Streaks separately.

---

## 🔧 Optional: Deploy Streaks MFE Too

If you want Streaks to work on live URL:

### **1. Deploy Streaks to Netlify**
- Same steps as Shell
- Import `fitlog-streaks` repo
- Get URL: `https://fitlog-streaks.netlify.app`

### **2. Update Shell's Federation Manifest**

Edit `fitlog-shell/public/federation.manifest.json`:

```json
{
  "fitlog-streaks": "https://fitlog-streaks.netlify.app/remoteEntry.json"
}
```

### **3. Redeploy Shell**
- Commit changes
- Push to GitHub
- Netlify auto-deploys!

**Now both MFEs work live!** 🎉

---

## 💰 Cost Summary

### **Current Setup (FREE):**
- Netlify Shell: FREE
- Netlify Streaks: FREE
- GitHub: FREE
- **Total: ₹0/month** ✅

### **With Free Domain:**
- Freenom (.tk, .ml, .ga): FREE
- Or use Netlify subdomain: FREE
- **Total: ₹0/month** ✅

### **With Paid Domain (Optional):**
- .com domain: ~₹800/year (₹67/month)
- Hosting: FREE
- **Total: ₹67/month** ✅

### **Future (with Backend):**
- Frontend: FREE (Netlify)
- Backend: Render FREE tier or ~₹500/month
- Database: MongoDB Atlas FREE tier
- **Total: ₹0-500/month** ✅

**All within budget!** 🎉

---

## 🆓 Free Domain Options

### **Option 1: Use Netlify Subdomain (Recommended)**
- URL: `https://fitlog-app.netlify.app`
- **Cost:** FREE
- **Pros:** Easy, SSL included, professional
- **Cons:** Not custom domain

### **Option 2: Freenom (Free .tk, .ml, .ga domains)**
- Go to: https://www.freenom.com
- Search for available domain
- Register for FREE (1 year)
- Connect to Netlify
- **Cost:** FREE
- **Pros:** Custom domain
- **Cons:** Not .com, renewal required

### **Option 3: GitHub Pages Custom Domain**
- If you have a domain, use GitHub Pages
- **Cost:** FREE hosting
- **Pros:** Free hosting
- **Cons:** Need to buy domain

### **Recommendation:**
Start with Netlify subdomain (FREE), buy .com later if needed!

---

## 📋 Deployment Checklist

### **Before Deployment:**
- [x] Shell code pushed to GitHub ✅
- [ ] Streaks code pushed to GitHub ⏳
- [ ] All features tested locally ✅
- [ ] Build tested (`npm run build`) ⏳

### **Deployment:**
- [ ] Netlify account created ⏳
- [ ] Shell deployed ⏳
- [ ] Live URL obtained ⏳
- [ ] Live URL tested ⏳

### **After Deployment:**
- [ ] Test Weight Tracker ⏳
- [ ] Test Trends/Charts ⏳
- [ ] Test all languages ⏳
- [ ] Test on mobile ⏳
- [ ] Share with friends! ⏳

---

## 🎯 Quick Commands Reference

### **Push Streaks to GitHub:**
```bash
cd fitlog-streaks
git remote add origin https://github.com/Sandeshth148/fitlog-streaks.git
git branch -M main
git push -u origin main
```

### **Test Local Build:**
```bash
cd fitlog-shell
npm run build
# Check dist/fitlog-shell/browser folder
```

### **Update Shell After Changes:**
```bash
cd fitlog-shell
git add .
git commit -m "Update: your message here"
git push
# Netlify auto-deploys!
```

---

## 🐛 Troubleshooting

### **Build Fails on Netlify:**
1. Check Node version (should be 20)
2. Go to Site settings → Environment variables
3. Add: `NODE_VERSION` = `20`
4. Retry deployment

### **Streaks Shows Error:**
- This is expected! Streaks needs localhost:4204
- Deploy Streaks separately to fix

### **Charts Not Showing:**
- Check browser console for errors
- Verify Chart.js is in dependencies
- Clear browser cache

---

## 🚀 Next Steps After Deployment

1. **Get Live URL** ✅
2. **Test Everything** ✅
3. **Share with Friends** 🎉
4. **Start AI Features** 🤖
5. **Deploy Streaks** (optional)
6. **Add Backend** (later)

---

## 📞 Need Help?

- **Netlify Docs:** https://docs.netlify.com/
- **Vercel Docs:** https://vercel.com/docs
- **Cloudflare Docs:** https://developers.cloudflare.com/pages/

---

## 🎉 You're Ready!

**Current Status:**
- ✅ Shell on GitHub
- ⏳ Streaks ready to push
- ⏳ Ready to deploy

**Next Action:**
1. Push Streaks to GitHub (5 min)
2. Deploy Shell to Netlify (10 min)
3. Get your live URL! 🌐

**Let's do this!** 🚀
