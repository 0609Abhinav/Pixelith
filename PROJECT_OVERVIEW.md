# Pixelith / Darkvampire Project Overview

## What This Website Is

Pixelith is a premium photography portfolio and booking website branded as **Darkvampire**. It is built for a photography studio, creative agency, or visual brand that wants to show curated work, organize galleries, explain services, collect bookings/contact messages, and expose a small admin dashboard.

The frontend is a cinematic React/Vite experience with animated page transitions, GSAP scroll reveals, image cards, gallery sections, blog cards, pricing, FAQs, and a theme toggle. The backend is a FastAPI API that serves site content and accepts booking/contact/admin requests.

## What The Website Does

- Shows a premium homepage with hero, stats, featured photos, categories, albums, services, testimonials, clients, process, blogs, and FAQs.
- Provides portfolio/gallery pages for browsing photography work.
- Provides album and photo modal flows.
- Provides service, pricing, about, experience, awards, testimonial, blog, FAQ, booking, contact, search, and admin pages.
- Uses `/api/site` content from the FastAPI backend, with frontend fallback data if the API is offline.
- Uses `/api/bookings` and `/api/contact` for form submissions.
- Uses `/api/auth/login` and `/api/admin/summary` for a simple demo admin dashboard.
- Uses MongoDB if configured, and falls back to in-memory lists during local development.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Framer Motion
- GSAP + ScrollTrigger
- Zustand
- Three.js / React Three Fiber dependencies are installed for richer visual scenes
- CSS in `src/styles.css`

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- python-jose JWT auth
- Motor / MongoDB optional persistence

## Main Folder Structure

```text
Pixelith/
  backend/
    main.py              FastAPI app and API routes
    data.py              Static site content served by /api/site
    db.py                MongoDB connection helper with fallback behavior
    requirements.txt     Backend Python dependencies

  src/
    App.tsx              Main React app, routing, pages, layout, modals
    api.ts               Axios API client functions
    fallback.ts          Frontend fallback site data if backend is unavailable
    types.ts             Shared frontend TypeScript data types
    store.ts             Zustand app state, theme, admin token
    styles.css           Main styling for all pages/components
    media.ts             Image utility helpers
    icons.tsx            Local icon wrappers

    components/
      HeroScene.tsx      Cinematic intro/loading hero scene
      InteractiveCard.tsx Tilt/interactive card component
      Loader.tsx         Cinematic loader component
      ScrollProgress.tsx Scroll progress indicator
      SmartImage.tsx     Image component with loading/fallback behavior
      SmoothCursor.tsx   Custom cursor animation
      cinematic-hero.css Styles for the intro hero scene

    hooks/
      useScrollAnimations.ts GSAP scroll reveal, parallax, text, and stagger animations

  css/, js/, fonts/, img/, owl-carousel/
    Legacy/static assets from the older template

  package.json           Frontend scripts and dependencies
  vite.config.ts         Vite dev server and API proxy config
  tsconfig.json          TypeScript configuration
  tailwind.config.js     Tailwind config, if used later
  postcss.config.js      PostCSS config
  .gitignore             Ignored local/generated files
```

## Important Runtime Flow

1. `src/App.tsx` starts the React application shell.
2. `useSiteData()` calls `fetchSite()` from `src/api.ts`.
3. `fetchSite()` requests `/api/site`.
4. Vite proxies `/api` to the FastAPI backend during local development.
5. If the backend is unavailable, `fallbackSite` keeps the frontend usable.
6. React Router renders the selected page.
7. `useScrollAnimations()` attaches GSAP/ScrollTrigger animations to elements with attributes like `data-animate`, `data-scroll`, `data-scale`, `data-stagger`, and `data-reveal`.
8. Forms call backend endpoints for booking/contact/admin actions.

## Common Commands

Install frontend dependencies:

```bash
npm install --cache .npm-cache
```

Create and install backend environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install cryptography==41.0.7
python -m pip install -r backend/requirements.txt
```

Run backend on port 8001:

```bash
.venv/bin/python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

Run frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Run both together if `package.json` backend script is configured correctly:

```bash
npm run dev:full
```

## API Routes

### Public Content

- `GET /api/health` - backend health check
- `GET /api/site` - full site content
- `GET /api/seo?path=/...` - SEO metadata
- `GET /api/photos` - photo list with optional filters
- `GET /api/albums` - albums
- `GET /api/blogs` - blog posts
- `GET /api/faqs` - FAQs
- `GET /api/search?q=...` - search photos, albums, and blogs

### Forms

- `POST /api/bookings` - submit booking request
- `POST /api/contact` - submit contact message

### Admin

- `POST /api/auth/login` - demo admin login
- `GET /api/admin/summary?token=...` - dashboard summary

Default demo admin credentials in the current code:

```text
Email: admin@darkvampire.studio
Password: admin123
```

## Current Animation Setup

The project uses three animation layers:

- `Framer Motion` for route transitions, tooltips, and cards.
- `GSAP ScrollTrigger` in `useScrollAnimations.ts` for scroll reveal/parallax/stagger/text animations.
- `HeroScene.tsx` for the cinematic intro scene.

Important rule: content should never depend on animation to become visible. The GSAP hook should animate elements when they enter view, but should not permanently hide sections before ScrollTrigger has measured the page.

## Things This Website Is Missing Or Should Improve

### Content And Branding

- Replace placeholder developer links and emails in `backend/data.py` and `src/fallback.ts`.
- Replace demo brand copy if the final brand is not Darkvampire.
- Replace stock Unsplash images with real portfolio images.
- Add real client logos instead of text-only client chips.
- Add clear studio location, phone, and contact details.

### Backend And Security

- Move `SECRET_KEY`, admin credentials, and MongoDB URI into `.env` variables.
- Remove hardcoded MongoDB credentials from `backend/db.py`.
- Hash admin passwords instead of storing plain text.
- Use Authorization headers for admin token instead of query params.
- Add request validation/rate limiting for forms.
- Add proper production CORS origins instead of allowing everything.

### Product Features

- Add real CMS/admin editing screens for photos, blogs, pricing, FAQs, and services.
- Add image upload/storage instead of hardcoded image URLs.
- Add booking calendar availability.
- Add email notifications for bookings/contact forms.
- Add pagination or infinite loading for large galleries.
- Add image detail pages with shareable URLs.
- Add analytics events for CTA clicks, form submissions, and gallery opens.

### Frontend Quality

- Add route-level lazy loading/code splitting to reduce the large JS bundle.
- Add loading and error states for search/admin/API calls.
- Add better empty states if API data arrays are empty.
- Improve accessibility labels and keyboard flows for modals/cards.
- Add Playwright or React Testing Library tests for major routes.
- Add responsive QA for mobile/tablet/desktop.

### Developer Experience

- Add `.env.example` for backend/frontend variables.
- Add a single script for backend on port `8001` if that is the preferred local port.
- Add lint/typecheck scripts to `package.json`.
- Add README setup steps matching the real folder and port.
- Remove old legacy static assets if they are no longer used.

## Recommended Next Steps

1. Confirm final local backend port: `8000` or `8001`.
2. Update `vite.config.ts` proxy to match that backend port.
3. Move secrets and credentials into `.env`.
4. Replace stock images and placeholder links.
5. Add admin edit forms if the website needs to be content-managed.
6. Add tests for homepage rendering, gallery filtering, search, booking, contact, and admin login.
