# RoomSetu Deployment Summary

## Current Status

### Frontend ✅ DEPLOYED
- **Platform:** Vercel
- **URL:** https://roomsetu-frontend.vercel.app (or your actual URL)
- **Branch:** main
- **Framework:** Vite + React
- **Build:** Automated on GitHub push

### Backend 🔄 READY FOR DEPLOYMENT
- **Platform:** Render (free tier)
- **Framework:** Express.js + Node.js
- **Status:** Ready to deploy
- **Root Directory:** `backend/`

---

## Quick Deployment Checklist

### Before Deploying to Render

- [ ] Backend runs locally: `cd backend && npm run dev`
- [ ] Build works: `cd backend && npm run build`
- [ ] GitHub is up to date: `git push origin main`
- [ ] Backend is in `backend/` folder with `package.json`
- [ ] `backend/src/server.ts` is the entry point

### Render Deployment (9 Steps)

1. **Sign up** at https://render.com with GitHub
2. **Create Web Service** from `Rushizagade/RoomSetu`
3. **Set Root Directory** to: `backend`
4. **Set Build Command** to: `npm install && npm run build`
5. **Set Start Command** to: `npm run start`
6. **Add Environment Variables** (see list below)
7. **Click "Create Web Service"** and wait 2-5 minutes
8. **Test Health Check** at `/health` endpoint
9. **Update Frontend** with backend URL

### Required Environment Variables

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-min-32-chars>
JWT_EXPIRES_IN=7d
JWT_ADMIN_EXPIRES_IN=1d
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
MAX_JSON_SIZE=15mb
OTP_EXPIRY_MINUTES=10
LOG_LEVEL=info
GOOGLE_MAPS_API_KEY=<your-api-key>
APP_URL=https://your-render-backend-url.onrender.com
```

### Key Settings in Render

| Setting | Value |
|---------|-------|
| Name | `roomsetu-backend` |
| Environment | `Node` |
| Region | Closest to users |
| Branch | `main` |
| **Root Directory** | **`backend`** ← IMPORTANT |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |

---

## What Gets Deployed

```
backend/
├── src/
│   ├── server.ts          ← Entry point
│   ├── app.ts             ← Express app
│   ├── services/          ← Business logic
│   ├── controllers/       ← Request handlers
│   ├── routes/            ← API routes
│   ├── repositories/      ← Data layer
│   ├── middleware/        ← Auth, validation
│   ├── config/            ← Configuration
│   └── database/          ← Database setup
├── package.json           ← Dependencies
├── tsconfig.json          ← TypeScript config
└── .env.example           ← Environment template
```

---

## After Deployment

### Update Frontend

Once backend is live at `https://roomsetu-backend.onrender.com`:

1. Edit `frontend/src/services/api.ts`:
```typescript
const BASE_URL = 'https://roomsetu-backend.onrender.com';
```

2. Edit `frontend/.env.example`:
```
VITE_API_URL=https://roomsetu-backend.onrender.com
```

3. Commit and push:
```bash
git add .
git commit -m "feat: update backend URL to production"
git push origin main
```

4. Vercel automatically redeploys frontend

---

## Testing the Deployment

### Health Check
```bash
curl https://roomsetu-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "port": 3000,
  "timestamp": "..."
}
```

### Send OTP
```bash
curl -X POST https://roomsetu-backend.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### Search Properties
```bash
curl "https://roomsetu-backend.onrender.com/api/properties/search?city=Pune"
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails | Wrong Root Directory | Set to `backend` |
| Can't find app | Missing package.json | Check `backend/package.json` exists |
| Port error | Port in use | Render manages this, no action needed |
| CORS errors | Wrong CORS_ORIGIN | Update env var to frontend URL |
| 404 errors | Routes not found | Check `backend/src/routes/` |

---

## Monitoring

In Render dashboard:
- **Logs tab**: View real-time logs
- **Environment tab**: Update env vars
- **Settings tab**: Change configuration
- **Manual Deploy**: Redeploy if needed

Auto-redeploy on GitHub push to `main` branch.

---

## Documentation Files

- `RENDER_DEPLOYMENT.md` - Detailed step-by-step guide (you are here)
- `DEPLOYMENT_SUMMARY.md` - Quick reference (you are here)
- `VERCEL_DEPLOYMENT.md` - Frontend deployment info
- `backend/.env.example` - Environment variables template

---

## Next Steps

1. Go to https://render.com
2. Sign up with GitHub
3. Follow 9 steps in "Quick Deployment Checklist"
4. Test health endpoint
5. Update frontend with backend URL
6. Monitor logs in Render dashboard

**Estimated time: 15 minutes**

