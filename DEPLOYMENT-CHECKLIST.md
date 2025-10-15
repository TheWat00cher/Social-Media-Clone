# 📋 Deployment Checklist

Use this checklist to track your deployment progress.

## ☁️ Pre-Deployment Setup

### MongoDB Atlas
- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Saved database username: ________________
- [ ] Saved database password: ________________
- [ ] Added IP Address 0.0.0.0/0 to Network Access
- [ ] Obtained connection string
- [ ] Updated connection string with password and database name
- [ ] Saved full connection string: ________________

### Cloudinary
- [ ] Created Cloudinary account
- [ ] Verified email
- [ ] Noted Cloud Name: ________________
- [ ] Noted API Key: ________________
- [ ] Noted API Secret: ________________
- [ ] (Optional) Created upload preset

### GitHub
- [ ] All code committed locally
- [ ] All code pushed to GitHub
- [ ] Repository is accessible
- [ ] Repository URL: ________________

---

## 🚂 Backend Deployment (Railway)

- [ ] Created Railway account (signed in with GitHub)
- [ ] Created new project from GitHub repo
- [ ] Selected correct repository
- [ ] Set root directory to `backend`
- [ ] Set start command to `npm start`
- [ ] Added environment variable: `NODE_ENV=production`
- [ ] Added environment variable: `PORT=5000`
- [ ] Added environment variable: `MONGODB_URI=...`
- [ ] Added environment variable: `JWT_SECRET=...` (min 32 chars)
- [ ] Added environment variable: `JWT_EXPIRE=7d`
- [ ] Added environment variable: `CLOUDINARY_CLOUD_NAME=...`
- [ ] Added environment variable: `CLOUDINARY_API_KEY=...`
- [ ] Added environment variable: `CLOUDINARY_API_SECRET=...`
- [ ] Added environment variable: `CORS_ORIGIN=...` (temporary, will update later)
- [ ] Deployment completed successfully
- [ ] Generated domain
- [ ] Backend URL: ________________
- [ ] Tested health endpoint: `https://your-url.railway.app/api/health`
- [ ] Checked logs for "MongoDB Connected Successfully"
- [ ] No errors in Railway logs

---

## ⚡ Frontend Deployment (Vercel)

- [ ] Created Vercel account (signed in with GitHub)
- [ ] Imported project from GitHub
- [ ] Set root directory to `frontend`
- [ ] Confirmed framework preset: Create React App
- [ ] Set build command to `npm run build`
- [ ] Set output directory to `build`
- [ ] Added environment variable: `REACT_APP_API_URL=<Railway URL>/api`
- [ ] Clicked Deploy
- [ ] Deployment completed successfully
- [ ] Frontend URL: ________________
- [ ] Visited frontend URL and site loads

---

## 🔄 Post-Deployment Configuration

- [ ] Returned to Railway dashboard
- [ ] Updated `CORS_ORIGIN` to Vercel frontend URL
- [ ] Railway redeployed automatically
- [ ] Waited for redeployment to complete

---

## ✅ Testing

### Authentication
- [ ] Can access frontend URL
- [ ] Register page loads
- [ ] Can create new account
- [ ] Email validation works
- [ ] Can login with new account
- [ ] Can logout
- [ ] Can login again
- [ ] Protected routes work (redirect to login when not authenticated)

### Profile
- [ ] Profile page loads
- [ ] Can view profile information
- [ ] Can edit profile (name, username, bio)
- [ ] Can upload profile picture
- [ ] Profile picture displays correctly
- [ ] Changes save successfully

### Posts
- [ ] Home feed loads
- [ ] Can navigate to Create Post page
- [ ] Can create text-only post
- [ ] Can create post with image
- [ ] Image uploads successfully
- [ ] Posts appear in home feed
- [ ] Can view post details
- [ ] Can like/unlike posts
- [ ] Like count updates correctly

### Interactions
- [ ] Can comment on posts
- [ ] Comments display with correct user info
- [ ] Can search for users
- [ ] Search results load
- [ ] Can follow/unfollow users
- [ ] Follow counts update

### Browser Console
- [ ] No errors in browser console (F12 → Console)
- [ ] No failed network requests (F12 → Network)
- [ ] API calls use HTTPS
- [ ] Images load from Cloudinary

### Mobile Testing
- [ ] Site is responsive on mobile
- [ ] All features work on mobile
- [ ] Images display correctly on mobile

---

## 🔍 Troubleshooting Checks

If something doesn't work, verify:

- [ ] All Railway environment variables are set correctly
- [ ] All Vercel environment variables are set correctly
- [ ] CORS_ORIGIN in Railway matches Vercel URL exactly
- [ ] REACT_APP_API_URL in Vercel matches Railway URL exactly
- [ ] MongoDB connection string has correct password
- [ ] MongoDB Network Access allows 0.0.0.0/0
- [ ] Cloudinary credentials are correct (no typos)
- [ ] Both frontend and backend use HTTPS in production
- [ ] Railway backend is running (check Metrics)
- [ ] No errors in Railway logs
- [ ] No errors in Vercel deployment logs

---

## 📊 Monitoring Setup

- [ ] Bookmarked Railway dashboard
- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked MongoDB Atlas dashboard
- [ ] Bookmarked Cloudinary dashboard
- [ ] Set up email alerts in MongoDB Atlas (optional)
- [ ] Joined Railway Discord for support (optional)

---

## 🎉 Final Steps

- [ ] Shared app with friends for testing
- [ ] Documented any issues found
- [ ] Created list of future improvements
- [ ] Backed up important data
- [ ] Saved all credentials securely
- [ ] Updated README with live URLs
- [ ] Celebrated successful deployment! 🎊

---

## 📝 Important URLs & Credentials

**Keep this information secure!**

### Production URLs
- Frontend: ________________
- Backend: ________________

### MongoDB Atlas
- Cluster URL: ________________
- Database Name: ________________
- Username: ________________
- Password: ________________ (keep secure!)

### Cloudinary
- Cloud Name: ________________
- API Key: ________________
- API Secret: ________________ (keep secure!)

### JWT
- JWT_SECRET: ________________ (keep secure!)

### GitHub
- Repository: ________________

---

**Last Updated:** _____________
**Deployed By:** _____________
**Deployment Date:** _____________

---

## 🆘 Quick Support Links

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [DEPLOYMENT.md Guide](./DEPLOYMENT.md) - Full detailed guide

---

**Good luck! You've got this! 💪**
