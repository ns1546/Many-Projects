# Tawsif Mahbub — Official Public Archive & Artist Portfolio

> Award-Winning Bangladeshi Television & OTT Actor | Meril-Prothom Alo Best Actor Winner | 13+ Years of Screen Excellence

---

## 🌟 Overview & Key Features

- **Luxury Magazine Editorial Aesthetics:** Anti-slop warm alabaster palette (`#fcfbf9` / `#1a1918` / `#c5a059`), generous typography rhythm, and relaxed readability.
- **Dedicated Multi-Page Routing:**
  - `/` — Editorial Hero Showcase, Career Metrics, Curated Work Highlights, Quick Exploration.
  - `/filmography` — Complete Repertoire (130+ dramas & series), real-time search, category filtering, and direct links.
  - `/works/:slug` — Dedicated Deep-Dive Dossier for every landmark production (synopsis, director notes, co-stars, streaming links, gallery).
  - `/biography` — Artistic Trajectory, 4 Defining Eras, The Actor's Craft (2-column methodology pillars), Character Metamorphosis, and Directorial Critiques.
  - `/biography/:slug` — Full Archival Chapter Dossiers (Formative Years & Music, Breakthrough & Rapid Ascent, Dual Mastery & Television Dominance, Mature Naturalism & OTT Reinvention).
  - `/awards` — Meril-Prothom Alo, BIFA, RTV Star Awards, and Lifetime Nominations.
  - `/awards/:slug` — Complete citation and archival records for landmark honors.
  - `/gallery` — High-resolution studio portraits, on-set stills, and key art posters with lightbox inspection.
  - `/contact` — Formal talent representation, screenplay review guidelines, and direct booking inquiries.
- **Sleek Navigation System:** Minimalist menu button with colored gold border active state, smooth navigation drawer, and balanced 4-column colophon footer.

---

## 🚀 Quick Start (Running Locally)

### Option 1: Double-Click Launcher (Windows)
- **Development Server:** Double-click `run-website.bat` (opens `http://localhost:4321/`).
- **Production Preview:** Double-click `preview-website.bat`.

### Option 2: Terminal Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## 📦 Project Structure

```
├── dist/                    # Pre-built, optimized static distribution (ready to deploy)
├── public/                  # Static assets, official portraits, posters, media
│   └── assets/
│       ├── gallery/         # Studio portraits and high-res stills
│       └── works/           # Production posters and key art
├── src/
│   ├── components/          # Reusable editorial components (Header, Footer, ActorsCraft, etc.)
│   ├── data/                # Master verified dossier (dossierData.js)
│   ├── pages/               # Multi-page application views
│   │   ├── HomePage.jsx
│   │   ├── FilmographyPage.jsx
│   │   ├── WorkDetailPage.jsx
│   │   ├── BiographyPage.jsx
│   │   ├── BiographySubPage.jsx
│   │   ├── AwardsPage.jsx
│   │   ├── AwardSubPage.jsx
│   │   ├── GalleryPage.jsx
│   │   └── ContactPage.jsx
│   ├── App.jsx              # React Router setup & global layout
│   └── index.css            # Master luxury editorial design system & styling
├── index.html               # Main entry HTML
├── vite.config.js           # Vite bundler configuration (Port 4321)
├── package.json             # Dependencies and scripts
└── run-website.bat          # 1-click Windows runner
```

---

## 🌐 Production Deployment

The `dist/` folder is a self-contained, statically optimized production bundle. You can deploy it instantly to:
- **Vercel / Netlify:** Drag-and-drop the `dist` folder or connect the repository.
- **GitHub Pages:** Deploy the `dist` directory.
- **Apache / cPanel / Shared Hosting:** Upload the contents of `dist` directly into `public_html`.

---
© Tawsif Mahbub. Official Artist Website. All rights reserved.
