# 🚀 Quick Deployment Guide

**Fast-track guide for deploying SocialConnect to production**

For detailed step-by-step instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## ⚡ Quick Steps (30 minutes total)

### 1. MongoDB Atlas (5 min)
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create M0 FREE cluster
3. Create database user → Save password
4. Network Access → Add 0.0.0.0/0
5. Get connection string → Replace `<password>` and add database name

### 2. Cloudinary (3 min)
1. Sign up: https://cloudinary.com/users/register/free
2. Dashboard → Copy: Cloud Name, API Key, API Secret

### 3. Railway - Backend (10 min)
1. Sign up: https://railway.app (use GitHub)
2. New Project → Deploy from GitHub → Select your repo
3. Settings → Root Directory: `backend`
4. Settings → Start Command: `npm start`
5. Variables → Add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<from step 1>
   JWT_SECRET=<random 32+ char string>
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=<from step 2>
   CLOUDINARY_API_KEY=<from step 2>
   CLOUDINARY_API_SECRET=<from step 2>
   CORS_ORIGIN=http://localhost:3000
   ```
6. Settings → Domains → Generate Domain → **Save URL**

### 4. Vercel - Frontend (8 min)
1. Sign up: https://vercel.com/signup (use GitHub)
2. Add New → Project → Import your repo
3. Root Directory → Select `frontend`
4. Environment Variables → Add:
   ```
   REACT_APP_API_URL=<Railway URL from step 3>/api
   ```
5. Deploy → Wait → **Save URL**

### 5. Update CORS (2 min)
1. Railway → Variables → Update `CORS_ORIGIN` with Vercel URL
2. Wait for auto-redeploy

### 6. Test (2 min)
1. Visit Vercel URL
2. Register account
3. Create post
4. Upload image

---

## 🎯 Environment Variables Summary

### Railway (Backend)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/socialconnect?retryWrites=true&w=majority
JWT_SECRET=your_random_32_character_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CORS_ORIGIN=https://your-app.vercel.app
```

### Vercel (Frontend)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## ✅ Checklist

- [ ] MongoDB Atlas account + connection string
- [ ] Cloudinary account + API credentials
- [ ] Railway backend deployed + URL saved
- [ ] Vercel frontend deployed + URL saved
- [ ] CORS updated with Vercel URL
- [ ] App tested and working

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Can't connect to backend | Check REACT_APP_API_URL in Vercel, verify Railway is running |
| MongoDB connection error | Check connection string, password, Network Access (0.0.0.0/0) |
| Image upload fails | Verify Cloudinary credentials, check Railway logs |
| CORS error | Update CORS_ORIGIN in Railway with exact Vercel URL |
| Build failed | Check root directory settings, review deployment logs |

---

## 📚 Full Documentation

- **Detailed Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete step-by-step with screenshots
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Track your progress
- **Local Setup**: [SETUP.md](./SETUP.md) - Run locally

---

## 💰 Cost: $0/month (Free Tier)

All services have generous free tiers:
- Vercel: Free forever
- Railway: $5 credit/month (~500 hours)
- MongoDB Atlas: 512MB free
- Cloudinary: 25GB/month free

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions!
