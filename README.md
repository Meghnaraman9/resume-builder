# ✦ ResumeCraft — Resume Builder

Full-stack resume builder: live preview, 4 templates, PDF download.  
**Backend → Render · Frontend → Netlify**

---

## 📁 Structure

```
resume-builder/
├── backend/
│   ├── server.js       ← Express API + Puppeteer PDF
│   ├── package.json
│   └── render.yaml     ← Render deploy config
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── config.js       ← ← ← PUT YOUR RENDER URL HERE
├── netlify.toml        ← Netlify deploy config
├── .gitignore
└── README.md
```

---

## 🚀 Deployment (Step-by-Step)

### STEP 1 — Push to GitHub

```bash
# In the resume-builder folder
git init
git add .
git commit -m "initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/resume-builder.git
git branch -M main
git push -u origin main
```

---

### STEP 2 — Deploy Backend on Render

1. Go to **[render.com](https://render.com)** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select your **resume-builder** repo
4. Fill in the settings:
   | Field | Value |
   |-------|-------|
   | Name | `resume-builder-api` |
   | Root Directory | `backend` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Plan | `Free` |
5. Click **"Create Web Service"**
6. Wait ~3–5 minutes for the build to finish
7. **Copy your service URL** — looks like `https://resume-builder-api.onrender.com`

---

### STEP 3 — Update the Frontend with your Render URL

Open **`frontend/config.js`** and replace the placeholder:

```js
// BEFORE
window.RESUME_API_BASE = "https://YOUR-APP-NAME.onrender.com";

// AFTER (use your real Render URL)
window.RESUME_API_BASE = "https://resume-builder-api.onrender.com";
```

Then commit and push:
```bash
git add frontend/config.js
git commit -m "set render api url"
git push
```

---

### STEP 4 — Deploy Frontend on Netlify

1. Go to **[netlify.com](https://netlify.com)** → Sign up / Log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → select your **resume-builder** repo
4. Fill in:
   | Field | Value |
   |-------|-------|
   | Base directory | *(leave empty)* |
   | Build command | *(leave empty)* |
   | Publish directory | `frontend` |
5. Click **"Deploy site"**
6. Your site will be live at `https://YOUR-SITE-NAME.netlify.app`

---

### STEP 5 — Update CORS on Render (optional but recommended)

In Render dashboard → your service → **Environment** tab:  
Add environment variable:
```
FRONTEND_URL = https://YOUR-SITE-NAME.netlify.app
```
Then click **"Save Changes"** — Render will redeploy automatically.

---

## ⚠️ Notes

- **Render free tier spins down after 15 min of inactivity** — first PDF after idle takes ~30s to wake up. This is normal.
- **Puppeteer** downloads Chromium during `npm install` on Render — build takes 3–5 min.
- Local dev still works: `config.js` falls back to `http://localhost:3001` automatically.

---

## 🛠 Local Development

```bash
cd backend && npm install && npm start   # → http://localhost:3001
# Open frontend/index.html in browser
```

---

## ✨ Features
- 4 resume templates (Classic, Modern, Minimal, Bold)
- Dynamic experience, education, projects, certifications sections
- Skill tag input
- Live side-panel preview
- Server-side PDF generation (Puppeteer / Chromium)
- Auto-save to localStorage
