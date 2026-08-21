# RoomSetu Backend Deployment on Render

Complete step-by-step guide to deploy your Express.js backend on Render.com

---

## Prerequisites

- GitHub repository: `Rushizagade/RoomSetu`
- Backend code in: `backend/` folder
- GitHub account
- Render account (free tier available)

---

## Step 1: Prepare Your Backend for Deployment

### 1.1 Update Backend Environment Variables

Edit `backend/.env.example` and add production values:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<CHANGE_THIS_TO_A_STRONG_SECRET>
JWT_EXPIRES_IN=7d
JWT_ADMIN_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend-url.vercel.app
MAX_JSON_SIZE=15mb
OTP_EXPIRY_MINUTES=10
LOG_LEVEL=info
GOOGLE_MAPS_API_KEY=<YOUR_API_KEY>
APP_URL=https://your-backend-url.onrender.com
```

### 1.2 Verify Backend Package.json Scripts

Your `backend/package.json` should have:

```json
{
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "esbuild src/server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  }
}
```

✅ Verified: Correct scripts in place

### 1.3 Create Render Configuration File

Create `backend/render.yaml` (optional but recommended):

```yaml
services:
  - type: web
    name: roomsetu-backend
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

---

## Step 2: Create Render Account & Connect GitHub

### 2.1 Sign Up for Render
1. Go to https://render.com
2. Click **"Sign up"**
3. Choose **"Continue with GitHub"**
4. Authorize Render to access your GitHub account

### 2.2 Grant Repository Access
1. After authorization, you'll see your GitHub account
2. Make sure `Rushizagade/RoomSetu` is visible
3. If not, update GitHub permissions in settings

---

## Step 3: Create New Web Service on Render

### 3.1 Start New Deployment
1. Go to Render dashboard: https://dashboard.render.com
2. Click **"New"** button (top-right)
3. Select **"Web Service"**

### 3.2 Connect Repository
1. Click **"Connect account"** next to GitHub
2. Select **`Rushizagade/RoomSetu`** repository
3. Click **"Connect"**

### 3.3 Configure Web Service

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `roomsetu-backend` |
| **Environment** | `Node` |
| **Region** | Select closest to users (default: Oregon) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |

**Important:** Set the Root Directory to `backend` — this tells Render to deploy from the backend folder, not the root.

---

## Step 4: Add Environment Variables

### 4.1 In Render Dashboard
1. Scroll down to **"Environment Variables"** section
2. Add each variable:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<your-strong-secret-key>
JWT_EXPIRES_IN=7d
JWT_ADMIN_EXPIRES_IN=1d
CORS_ORIGIN=https://roomsetu-frontend.vercel.app
MAX_JSON_SIZE=15mb
OTP_EXPIRY_MINUTES=10
LOG_LEVEL=info
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
APP_URL=https://roomsetu-backend.onrender.com
```

### 4.2 Important Notes
- Replace `roomsetu-frontend.vercel.app` with your actual Vercel frontend URL
- Generate a strong `JWT_SECRET` (minimum 32 characters)
- Add your Google Maps API key if you use location features
- Do NOT commit `.env` to GitHub (it's in `.gitignore`)

---

## Step 5: Deploy Backend

### 5.1 Click "Create Web Service"
1. Review all settings one more time
2. Click the **"Create Web Service"** button
3. Render will start building

### 5.2 Monitor Build Logs
Render will automatically:
1. Clone your repository
2. Navigate to `backend/` folder (Root Directory)
3. Run: `npm install`
4. Run: `npm run build`
5. Run: `npm run start` (when deployment is live)

**Expected logs:**
```
Building roomsetu-backend...
Installing dependencies...
Building with esbuild...
Build complete ✓
Deploying to production...
Server running on port 3000
```

### 5.3 Wait for Deployment
- Build takes 2-5 minutes
- Service will be live when status changes to **"Live"** (green)

---

## Step 6: Configure Frontend to Use Backend

Once backend is deployed and you have the URL (e.g., `https://roomsetu-backend.onrender.com`):

### 6.1 Update Frontend API Configuration

Edit `frontend/src/services/api.ts`:

```typescript
const BASE_URL = process.env.VITE_API_URL || 'https://roomsetu-backend.onrender.com';
```

### 6.2 Update Frontend Environment Variables

Edit `frontend/.env.example`:

```
VITE_API_URL=https://roomsetu-backend.onrender.com
```

### 6.3 Commit and Push

```bash
git add frontend/.env.example frontend/src/services/api.ts
git commit -m "feat: update frontend to use production backend URL"
git push origin main
```

This will trigger a Vercel redeploy automatically.

---

## Step 7: Verify Deployment

### 7.1 Test Backend Health Check

Open in browser or curl:
```
https://roomsetu-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-21T...",
  "port": 3000
}
```

### 7.2 Test API Endpoints

Example: Send OTP
```bash
curl -X POST https://roomsetu-backend.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

### 7.3 Check CORS Configuration

Your frontend should now be able to:
- ✅ Login/Register users
- ✅ Search properties
- ✅ Create inquiries
- ✅ All API endpoints

---

## Step 8: Troubleshooting

### Issue: "Build failed"

**Check the logs:**
1. Click on the service in Render dashboard
2. Go to **"Logs"** tab
3. Look for error messages

**Common causes:**
- Wrong Root Directory (should be `backend`)
- Missing environment variables
- Dependencies not installing

**Solution:**
```bash
# Test build locally
cd backend
npm install
npm run build
npm run start
```

### Issue: "Port already in use"

Render automatically uses port 3000. No action needed.

### Issue: Frontend can't reach backend

1. Check CORS_ORIGIN in backend env vars
2. Verify frontend is calling correct backend URL
3. Check browser console for CORS errors

---

## Step 9: Monitor & Maintain

### 9.1 View Logs in Render
1. Go to service page
2. Click **"Logs"** tab
3. Monitor for errors in real-time

### 9.2 Redeploy Changes

When you push to GitHub:
1. Render auto-detects commits on `main` branch
2. Automatically rebuilds and deploys
3. No manual action needed

To manually redeploy:
1. Click **"Manual Deploy"** button
2. Select branch (`main`)
3. Render rebuilds and deploys

### 9.3 Environment Variable Updates

To update env vars without redeploying:
1. Go to backend service
2. Click **"Environment"**
3. Edit variables
4. Click **"Save"**
5. Service restarts automatically

---

## Summary

| Step | Status |
|------|--------|
| Backend prepared ✓ | Ready |
| Render account created ✓ | Go to https://render.com |
| Web Service configured ✓ | Root Directory: `backend` |
| Environment variables set ✓ | All production values |
| Backend deployed ✓ | Check health endpoint |
| Frontend configured ✓ | Update API URL |
| Testing complete ✓ | All endpoints working |

---

## Your Backend URL

Once deployed, your backend will be available at:
```
https://roomsetu-backend.onrender.com
```

(The exact URL will be shown in your Render dashboard)

---

## Important Security Notes

1. **Never commit `.env` files** to GitHub
2. **Change JWT_SECRET** to a strong value in production
3. **Set CORS_ORIGIN** to your frontend URL only (not `*`)
4. **Keep API_KEY** secret and rotate regularly
5. **Enable free SSL/TLS** (Render does this automatically)

---

## Support

If you encounter issues:
1. Check Render logs for errors
2. Verify environment variables are set
3. Test locally: `npm run dev` in backend folder
4. Check GitHub for latest commits
5. Ensure Root Directory is set to `backend`

