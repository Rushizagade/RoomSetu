# Connect Frontend (Vercel) & Backend (Render)

Complete guide to connect your deployed frontend and backend.

---

## Current Setup

| Component | Platform | Status |
|-----------|----------|--------|
| **Frontend** | Vercel | ✅ Deployed |
| **Backend** | Render | ✅ Deployed |

---

## Step 1: Get Your Backend URL from Render

### 1.1 Open Render Dashboard
1. Go to https://dashboard.render.com
2. Click on `roomsetu-backend` service

### 1.2 Copy Backend URL
- Look for the **URL** shown at the top (e.g., `https://roomsetu-backend.onrender.com`)
- Copy this URL

**Example:**
```
https://roomsetu-backend.onrender.com
```

---

## Step 2: Update Frontend Environment Variables

### 2.1 Create `.env` File in Frontend

Create `frontend/.env`:

```env
VITE_API_URL=https://roomsetu-backend.onrender.com
```

Replace `roomsetu-backend.onrender.com` with your actual Render backend URL.

### 2.2 Update `.env.example` (for documentation)

Edit `frontend/.env.example`:

```env
VITE_API_URL=https://roomsetu-backend.onrender.com
```

---

## Step 3: Update Frontend API Configuration

### 3.1 Modify `frontend/src/services/api.ts`

At the top of the file, update:

**Before:**
```typescript
const API_BASE = '/api';
```

**After:**
```typescript
const API_BASE = process.env.VITE_API_URL ? `${process.env.VITE_API_URL}/api` : '/api';
```

This allows:
- ✅ Local development: Uses `/api` (proxied to localhost:3000)
- ✅ Production: Uses `https://your-backend.onrender.com/api`

### 3.2 Complete Updated Code

```typescript
import {
  AuthUser,
  Property,
  SearchFilters,
  SearchResponse,
  Inquiry,
  Visit,
  NotificationItem,
  PropertyReport,
  AuditLog,
  LocationSuggestion,
} from '../types/index.ts';

// ← UPDATE THIS LINE
const API_BASE = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('roomsetu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // ... rest of the file remains the same
}
```

---

## Step 4: Update Backend CORS Configuration

### 4.1 Update Backend Environment Variable

In **Render Dashboard** for `roomsetu-backend`:

1. Click **"Environment"** tab
2. Find `CORS_ORIGIN`
3. Update to your Vercel frontend URL:

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

**Example:**
```
CORS_ORIGIN=https://roomsetu-frontend.vercel.app
```

### 4.2 If No Vercel URL Yet

Temporarily set to allow any origin (less secure, development only):
```
CORS_ORIGIN=*
```

Then update it once you have your Vercel URL.

### 4.3 Save Environment Variable

1. Click **"Save"**
2. Render will restart the backend service
3. Check logs to confirm it started successfully

---

## Step 5: Commit Changes to GitHub

### 5.1 Create/Update Files

Make sure these files are updated:
- `frontend/.env` (local only, for development)
- `frontend/.env.example` (commit to GitHub)
- `frontend/src/services/api.ts` (commit to GitHub)

### 5.2 Commit Changes

```bash
cd c:\Users\Student\Documents\RoomSetu

# Add files
git add frontend/src/services/api.ts
git add frontend/.env.example

# Commit
git commit -m "feat: connect frontend to production backend on Render"

# Push to GitHub
git push origin main
```

### 5.3 Vercel Auto-Redeploy

Once pushed:
1. Vercel automatically detects the commit
2. Rebuilds the frontend
3. Deploys new version with backend URL
4. Takes 2-5 minutes

---

## Step 6: Test the Connection

### 6.1 Check Backend Health

Open in browser or curl:
```
https://your-backend-url.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "port": 3000
}
```

### 6.2 Test Frontend Connection

1. Go to your Vercel frontend: `https://your-frontend-url.vercel.app`
2. Try these actions:
   - **Login** → Sends OTP to backend ✅
   - **Register** → Verifies OTP with backend ✅
   - **Search Properties** → Fetches from backend ✅
   - **Send Inquiry** → Creates inquiry on backend ✅

### 6.3 Check Browser Console

Open browser DevTools (F12):
1. Go to **Network** tab
2. Try logging in
3. You should see requests to `https://your-backend-url.onrender.com/api/...`
4. Status should be **200** (success)

---

## Step 7: Verify All APIs Work

### Test Each Major API

```bash
# 1. Health Check
curl https://your-backend-url.onrender.com/health

# 2. Send OTP
curl -X POST https://your-backend-url.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","role":"USER"}'

# 3. Search Properties
curl "https://your-backend-url.onrender.com/api/properties/search?city=Pune"

# 4. Get Property Details
curl "https://your-backend-url.onrender.com/api/properties/PROPERTY_ID"
```

---

## Complete Configuration Summary

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Frontend (api.ts)
```typescript
const API_BASE = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : '/api';
```

### Backend (Render Environment Variables)
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
JWT_SECRET=<your-secret>
NODE_ENV=production
PORT=3000
```

---

## Troubleshooting

### Issue: "CORS Error" or "Failed to Fetch"

**Cause:** Backend CORS_ORIGIN not set correctly

**Fix:**
1. Go to Render dashboard
2. Update `CORS_ORIGIN` to your Vercel frontend URL
3. Save and wait for restart

### Issue: "404 Not Found" for API endpoints

**Cause:** Backend URL is wrong or offline

**Fix:**
1. Check backend URL in `frontend/.env`
2. Test health endpoint: `curl https://your-backend-url/health`
3. Verify backend is running on Render (green status)

### Issue: "Cannot POST /api/auth/send-otp"

**Cause:** API_BASE not including full URL in production

**Fix:**
```typescript
// Make sure it's:
const API_BASE = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : '/api';

// NOT just:
const API_BASE = '/api';
```

### Issue: "Invalid Token" or "401 Unauthorized"

**Cause:** JWT_SECRET mismatch

**Fix:**
1. Verify JWT_SECRET is set in Render
2. Make sure it's a strong value (min 32 chars)
3. Restart backend service

---

## Local Development Testing

### Before Deploying

Test locally first:

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Start frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

The frontend proxies `/api` to localhost:3000 automatically (see `frontend/vite.config.ts`).

---

## Monitoring

### Render Backend Logs
1. Go to Render dashboard
2. Click service
3. Go to **"Logs"** tab
4. Monitor for errors in real-time

### Vercel Frontend Logs
1. Go to Vercel dashboard
2. Click project
3. Go to **"Deployments"** → recent deployment
4. Click **"Logs"**

---

## URLs Reference

Replace these with your actual URLs:

| Service | URL | Example |
|---------|-----|---------|
| **Backend** | `https://your-backend.onrender.com` | `https://roomsetu-backend.onrender.com` |
| **Frontend** | `https://your-frontend.vercel.app` | `https://roomsetu-frontend.vercel.app` |
| **Health Check** | `{backend-url}/health` | `https://roomsetu-backend.onrender.com/health` |
| **API Base** | `{backend-url}/api` | `https://roomsetu-backend.onrender.com/api` |

---

## Next Steps

1. ✅ Copy backend URL from Render
2. ✅ Update `frontend/.env` with backend URL
3. ✅ Update `frontend/src/services/api.ts`
4. ✅ Update backend CORS_ORIGIN in Render
5. ✅ Commit and push to GitHub
6. ✅ Wait for Vercel to redeploy
7. ✅ Test connection in browser
8. ✅ Monitor logs for errors

**Time required: 10-15 minutes**

