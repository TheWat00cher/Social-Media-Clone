# 🚀 Deployment Guide - SocialConnect

This guide will walk you through deploying your MERN stack social media application to production using **Vercel** (Frontend), **Railway** (Backend), **MongoDB Atlas** (Database), and **Cloudinary** (Image Storage).

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account with your project repository
- [ ] All code committed and pushed to GitHub
- [ ] Project working locally without errors

## 🗂️ Overview

| Component | Service | Purpose | Free Tier |
|-----------|---------|---------|-----------|
| Frontend (React) | Vercel | Hosting React app | ✅ Yes |
| Backend (Node.js) | Railway | API server | ✅ Yes ($5 credit) |
| Database | MongoDB Atlas | Data storage | ✅ Yes (512MB) |
| File Storage | Cloudinary | Images/media | ✅ Yes (25GB/month) |

---

## 1️⃣ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google/GitHub or email
3. Complete the registration process

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider and region (choose closest to your users)
4. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Configure Database Access
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `socialconnect-admin`)
5. Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is needed for Railway to connect
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before the `?`: `...mongodb.net/socialconnect?retryWrites=true...`
7. **Save this - you'll need it later!**

---

## 2️⃣ Step 2: Set Up Cloudinary (Image Storage)

### 2.1 Create Account
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up with email or GitHub
3. Verify your email

### 2.2 Get API Credentials
1. Go to **Dashboard** (https://cloudinary.com/console)
2. You'll see your credentials:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` (click "eye" icon to reveal)
3. **Copy and save these credentials!**

### 2.3 Create Upload Preset (Optional but Recommended)
1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **"Add upload preset"**
4. Set preset name: `social-media-posts`
5. Set Signing Mode: **Unsigned**
6. Set Folder: `social-media-clone`
7. Click **"Save"**

---

## 3️⃣ Step 3: Deploy Backend to Railway

### 3.1 Create Railway Account
1. Go to [Railway](https://railway.app/)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub

### 3.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `Social-Media-Clone` repository
4. Railway will detect your project

### 3.3 Configure Backend Service
1. Railway might create two services - delete the frontend one
2. Click on the backend service
3. Go to **"Settings"**
4. Set **Root Directory** to: `backend`
5. Set **Start Command** to: `npm start`

### 3.4 Add Environment Variables
1. Go to **"Variables"** tab
2. Click **"New Variable"** and add each one:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/socialconnect?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_make_it_secure
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CORS_ORIGIN=https://your-app-name.vercel.app
```

**Important Notes:**
- Replace MongoDB URI with your actual connection string from Step 1
- Replace Cloudinary credentials from Step 2
- Generate a strong JWT_SECRET (random 32+ character string)
- CORS_ORIGIN will be updated after deploying frontend

### 3.5 Deploy and Get URL
1. Click **"Deploy"** (or it auto-deploys)
2. Wait for deployment to complete (2-5 minutes)
3. Go to **"Settings"** → **"Domains"**
4. Click **"Generate Domain"**
5. You'll get a URL like: `https://social-media-backend-production-xxxx.up.railway.app`
6. **Save this URL - this is your backend API URL!**
7. Test it by visiting: `https://your-backend-url.railway.app/api/health` (should return status)

### 3.6 Verify Deployment
1. Check the **"Deployments"** tab for any errors
2. Check **"Logs"** to see if MongoDB connected successfully
3. Look for: `MongoDB Connected Successfully` in logs

---

## 4️⃣ Step 4: Prepare Frontend for Deployment

### 4.1 Update API Configuration
Before deploying, you need to update the frontend to use your Railway backend URL.

1. Open `frontend/src/utils/api.js`
2. Update the base URL to use environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 4.2 Create Environment Variable File Template
Create a new file in the frontend folder for reference.

---

## 5️⃣ Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com/signup)
2. Click **"Continue with GitHub"**
3. Authorize Vercel

### 5.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your `Social-Media-Clone` repository
3. Click **"Import"**

### 5.3 Configure Project Settings
1. **Framework Preset**: Create React App (auto-detected)
2. **Root Directory**: Click **"Edit"** and select `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `build` (default)
5. **Install Command**: `npm install` (default)

### 5.4 Add Environment Variables
1. Expand **"Environment Variables"** section
2. Add the following:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://your-backend-url.railway.app/api` |

Replace with your actual Railway backend URL from Step 3.5

### 5.5 Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes for deployment
3. You'll get a URL like: `https://social-media-clone-xxxx.vercel.app`
4. **Save this URL!**

### 5.6 Set Up Custom Domain (Optional)
1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain if you have one
3. Follow Vercel's DNS configuration instructions

---

## 6️⃣ Step 6: Update CORS Settings

Now that you have your frontend URL, update the backend CORS configuration.

### 6.1 Update Railway Environment Variable
1. Go back to **Railway Dashboard**
2. Select your backend project
3. Go to **"Variables"** tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
5. Railway will automatically redeploy

### 6.2 Update Backend CORS Code (if needed)
If your backend code has hardcoded CORS settings, you may need to update:

1. Open `backend/src/server.js`
2. Ensure CORS is configured to use environment variable:
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 7️⃣ Step 7: Testing Your Deployment

### 7.1 Test Backend
1. Visit: `https://your-backend-url.railway.app/api/health`
2. Should return: `{"status":"ok"}` or similar

### 7.2 Test Frontend
1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try to register a new account
3. Login with the new account
4. Create a post
5. Upload an image
6. Test all features

### 7.3 Check Browser Console
1. Open browser DevTools (F12)
2. Go to **"Console"** tab
3. Look for any errors
4. Check **"Network"** tab for failed requests

---

## 🔧 Troubleshooting

### Issue: Frontend can't connect to backend
**Solutions:**
- Check if REACT_APP_API_URL is set correctly in Vercel
- Verify Railway backend is running (check Logs)
- Ensure CORS_ORIGIN includes your Vercel URL
- Check for HTTPS (both must use HTTPS in production)

### Issue: MongoDB connection failed
**Solutions:**
- Verify MongoDB Atlas connection string is correct
- Check if password in connection string matches exactly
- Ensure Network Access allows 0.0.0.0/0
- Verify database user has read/write permissions

### Issue: Image upload not working
**Solutions:**
- Verify Cloudinary credentials are correct
- Check if API Secret was copied correctly (no extra spaces)
- Look at Railway logs for Cloudinary errors
- Test credentials in Cloudinary dashboard

### Issue: 500 Internal Server Error
**Solutions:**
- Check Railway logs for specific error messages
- Verify all environment variables are set
- Ensure JWT_SECRET is set and long enough
- Check if MongoDB is connected (in logs)

### Issue: Build failed on Vercel
**Solutions:**
- Check if all dependencies are in package.json
- Verify Node version compatibility
- Look at build logs for specific errors
- Ensure root directory is set to `frontend`

### Issue: Railway deployment failed
**Solutions:**
- Verify root directory is set to `backend`
- Check if package.json exists in backend folder
- Ensure start script is defined in package.json
- Review deployment logs for errors

---

## 📊 Monitoring & Maintenance

### Railway Monitoring
1. Go to **Railway Dashboard**
2. Check **"Metrics"** tab for:
   - CPU usage
   - Memory usage
   - Network traffic
3. Monitor **"Logs"** for errors

### Vercel Monitoring
1. Go to **Vercel Dashboard**
2. Check **"Analytics"** for:
   - Page views
   - Performance metrics
3. Review **"Deployments"** for build status

### MongoDB Atlas Monitoring
1. Go to **MongoDB Atlas Dashboard**
2. Check **"Metrics"** for:
   - Operations per second
   - Connections
   - Storage usage
3. Set up alerts for usage limits

---

## 🔄 Updating Your Application

### Update Backend
1. Make changes to backend code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Railway automatically redeploys (if enabled)
4. Or manually trigger deployment in Railway dashboard

### Update Frontend
1. Make changes to frontend code locally
2. Test locally first
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
4. Vercel automatically redeploys
5. Check deployment status in Vercel dashboard

---

## 💰 Cost Breakdown (Free Tiers)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Free forever | 100GB bandwidth/month, 6,000 build minutes/month |
| **Railway** | $5 credit/month | ~500 hours of usage |
| **MongoDB Atlas** | Free forever | 512MB storage, shared CPU |
| **Cloudinary** | Free forever | 25GB storage, 25GB bandwidth/month |

**Estimated Monthly Cost: $0** (with free tiers)

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit .env files to GitHub
   - Use strong, random JWT_SECRET
   - Rotate secrets periodically

2. **Database Security**
   - Use strong database passwords
   - Regularly backup your data
   - Monitor for unusual activity

3. **API Security**
   - Keep dependencies updated
   - Monitor Railway logs for suspicious requests
   - Implement rate limiting (already in your code)

4. **CORS Configuration**
   - Only allow your Vercel domain
   - Don't use wildcard (*) in production

---

## 📝 Environment Variables Summary

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<strong-random-secret-32-chars>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CORS_ORIGIN=<your-vercel-frontend-url>
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=<your-railway-backend-url>/api
```

---

## 🎉 Deployment Complete!

Congratulations! Your social media application is now live!

**Your URLs:**
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-backend-url.railway.app`

**Next Steps:**
1. Share your app with friends
2. Monitor usage and performance
3. Collect feedback
4. Plan new features
5. Keep dependencies updated

---

## 📞 Need Help?

- **Railway Documentation**: https://docs.railway.app
- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## 📅 Deployment Checklist

Print this and check off as you go:

- [ ] MongoDB Atlas account created
- [ ] Database cluster created and configured
- [ ] Database connection string obtained
- [ ] Cloudinary account created
- [ ] Cloudinary API credentials obtained
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Backend environment variables set
- [ ] Backend URL obtained and tested
- [ ] Frontend API configuration updated
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Frontend URL obtained
- [ ] CORS settings updated with frontend URL
- [ ] All features tested on production
- [ ] No console errors in browser
- [ ] Mobile responsiveness tested
- [ ] Performance verified

---

**Good luck with your deployment! 🚀**
