# Quick Steps to Connect Frontend & Backend

## What You Need

1. Your **Backend URL** from Render (e.g., `https://roomsetu-backend.onrender.com`)
2. Your **Frontend URL** from Vercel (e.g., `https://roomsetu-frontend.vercel.app`)

---

## ✅ What I Already Did

1. ✅ Updated `frontend/src/services/api.ts` to use `process.env.VITE_API_URL`
2. ✅ Created `frontend/.env` with backend URL
3. ✅ Updated `frontend/.env.example` for documentation

---

## Now You Need To Do

### 1. Get Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click **"roomsetu-backend"** service
3. Copy the URL shown (e.g., `https://roomsetu-backend.onrender.com`)
4. Keep it handy

### 2. Update Backend CORS in Render

1. In Render dashboard for your backend service
2. Click **"Environment"** tab
3. Find `CORS_ORIGIN` variable
4. Update it to your Vercel frontend URL:
   ```
   https://your-vercel-frontend-url.vercel.app
   ```
5. Click **"Save"**
6. Backend will restart automatically

### 3. Commit & Push to GitHub

```bash
cd c:\Users\Student\Documents\RoomSetu

git add frontend/src/services/api.ts
git add frontend/.env.example

git commit -m "feat: connect frontend to production backend"

git push origin main
```

### 4. Vercel Auto-Redeploys

- Vercel detects your push
- Rebuilds frontend
- Deploys new version
- Takes 2-5 minutes

### 5. Test Connection

Open your frontend in browser:
```
https://your-frontend-url.vercel.app
```

Try to:
- Log in → Should reach backend
- Search properties → Should show results
- Send inquiry → Should create in database

---

## Environment Variables Reference

### Frontend `.env`
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend (Render Environment Variables)
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
JWT_SECRET=<your-secret>
NODE_ENV=production
```

---

## Check Connection

### Test Backend Health
```bash
curl https://your-backend-url.onrender.com/health
```

### Test API from Frontend Console

Open browser DevTools (F12) → Console:

```javascript
fetch('https://your-backend-url.onrender.com/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '9876543210', role: 'USER' })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## If Something Goes Wrong

### CORS Error?
- Update `CORS_ORIGIN` in Render to your frontend URL
- Save and wait 30 seconds for restart

### 404 API Errors?
- Check backend URL in `frontend/.env`
- Make sure backend is running (green status in Render)

### Token/Auth Errors?
- Make sure `JWT_SECRET` is set in Render
- Restart backend service

### Network Errors?
- Check internet connection
- Verify both Vercel and Render services are live
- Check Render logs for errors

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/services/api.ts` | Updated API_BASE to use env variable |
| `frontend/.env` | Created with backend URL |
| `frontend/.env.example` | Updated with VITE_API_URL |

---

## Next: Configure Render Backend

When ready, make these changes in Render dashboard:

1. Go to `roomsetu-backend` service
2. Environment tab
3. Update `CORS_ORIGIN` to your Vercel frontend URL
4. Save and wait for restart

That's it! Frontend and backend will be connected. 🚀

