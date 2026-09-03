# Taxi2 Frontend (Nuxt 3)

This folder contains a **Nuxt 3** SPA that works together with the existing Express backend.

## Project structure
```
frontend/
├─ app.vue               # Root component (renders <NuxtPage />)
├─ nuxt.config.ts       # Global meta tags, title, etc.
├─ package.json          # Nuxt dependencies and scripts
├─ pages/
│   └─ login.vue        # Login page (converted from the old HTML)
├─ public/
│   └─ assets/
│       └─ images/
│           ├─ logo/
│           │   └─ .gitkeep
│           └─ login/
│               └─ .gitkeep
└─ .gitignore
```

## How to run
```bash
# 1️⃣ Install dependencies (run once)
cd frontend
npm install   # pulls nuxt (v3) and its peer deps

# 2️⃣ Start the Nuxt dev server (default http://localhost:3000)
npm run dev
```
> The backend is already running on port 3000 (via `npm run dev`). If you need both on the same port, you can change the Nuxt dev port (`NUXT_PORT=3001 npm run dev`) and configure a reverse‑proxy (e.g., Nginx) or let Express serve the built Nuxt assets in production.

## Build for production
```bash
npm run build   # creates .output/ folder
npm run start   # serves the built app
```

## Meta tags & Open Graph
All meta tags (title, description, keywords, OG) are defined in **`nuxt.config.ts`**. Feel free to edit them there.

---
*Created automatically by the assistant.*
