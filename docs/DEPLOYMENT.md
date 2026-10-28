# OS Guardian 2.0 — Production & Cloud Deployment Guide

This guide details the deployment options for **OS Guardian — An Explainable, Self-Healing Operating System Simulator**.

---

## 1. Cloud Architecture Overview

Because OS Guardian features a Python FastAPI/WebSocket simulation engine coupled with a React SPA frontend, deployment requires:
1. **A Python ASGI Host** for the backend engine (FastAPI + Uvicorn) with WebSocket support.
2. **A Static/Edge CDN Host** for the React/TypeScript frontend (Vite build).
3. **Or a unified cloud container** (e.g. GitHub Codespaces / Docker).

```
[ Web Browser ]
      |
      +---> [ Frontend CDN (Vercel / Netlify / Cloudflare Pages) ]
      |
      +---> [ Backend API & WebSockets (Render / Railway / Fly.io) ]
                  |
            [ In-Memory OS Simulation Engine ]
```

---

## 2. Option A: 1-Click Browser Execution via GitHub Codespaces (Free, No Setup)

GitHub Codespaces spins up a full Linux VM with Python 3.11 and Node.js 20 in under 60 seconds directly inside any web browser:

1. Click: **[Open in GitHub Codespaces](https://codespaces.new/joshuadjd79-cmd/os-guardian)**
2. In the integrated terminal, execute:
   ```bash
   ./scripts/run_linux.sh
   ```
3. Port 5173 will auto-forward and open the interactive dashboard in a new browser tab.

---

## 3. Option B: Deployed Web Demo (Render + Vercel)

### Step 1: Deploy Backend to Render (Free Tier)
1. Log in to [Render.com](https://render.com).
2. Click **New +** &rarr; **Blueprint**.
3. Select your repository: `joshuadjd79-cmd/os-guardian`.
4. Render automatically parses `render.yaml` and provisions `os-guardian-backend`.
5. Once live, note your backend URL: e.g. `https://os-guardian-backend.onrender.com`.

### Step 2: Deploy Frontend to Vercel (Free Tier)
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** &rarr; **Project** &rarr; Import `joshuadjd79-cmd/os-guardian`.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables**, set:
   - `VITE_API_URL`: `https://os-guardian-backend.onrender.com`
5. Click **Deploy**. Vercel will build the React bundle using `npm run build` and route API calls via `vercel.json`.

---

## 4. Free Tier Hosting Disclosures

- **Render Free Tier Cold Starts:** Free instances spin down after 15 minutes of inactivity. When accessed after idling, the first request may experience a 30-50 second delay while the container starts.
- **WebSocket Timeout:** Free tier WebSocket idle connections are closed after 100 seconds without traffic. OS Guardian frontend includes an automatic exponential backoff reconnect handler.
- **CORS Configuration:** Deployed backends should add the Vercel production domain to `allow_origins` in `backend/app/main.py`.
