# MDFlow 📝

A modern, SaaS-style Sticky Notes app inspired by Microsoft Sticky Notes — with inline status changes, in-card checklists, and a resizable floating desktop-style widget.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · Zustand · lucide-react · Express + SQLite backend

## Run
```bash
npm install
npm run dev:full   # API (http://localhost:3001) + app (http://localhost:5173)
npm run build      # production build
npm run preview    # preview the build
```
`npm run dev:full` starts both the backend and the frontend together. You can
also run them separately with `npm run server` and `npm run dev`.

## Backend (database)
Users and notes are stored in a real **SQLite** database via a small Express
API in [server/](server/). The database file is created automatically at
`server/mdflow.db` on first run and the default accounts are seeded then.

Endpoints: `GET/PUT /api/users`, `GET/PUT /api/notes`, `POST /api/login`.
The frontend ([src/storage.ts](src/storage.ts)) loads data on startup and
pushes changes back; `localStorage` is kept only as an offline cache.

Default accounts: `admin@email.com` / `Admin1234?` (admin), `marie@email.com` /
`marie123` (user).

## Deploy on Vercel
Vercel runs the app as a **static Vite build + serverless functions**, so the
local Express server is *not* used in production. Instead, the same API is
provided by serverless functions in [api/](api/) backed by **Vercel Postgres**:

- `api/users.js`, `api/notes.js`, `api/login.js` — shared logic in [lib/db.mjs](lib/db.mjs)
- Data lives in Postgres via `@vercel/postgres` (tables are created and seeded
  automatically on the first request).

**One-time setup:**
1. In the Vercel dashboard → your project → **Storage** → create a **Postgres**
   database and connect it to the project. Vercel injects the `POSTGRES_URL`
   environment variables automatically.
2. **Redeploy** (or push a commit). The schema + default accounts are created
   on the first API call.

No `vercel.json` change is needed for routing — the app uses `HashRouter`, so
all client routes are served by `index.html`.

> Local dev uses SQLite (`npm run dev:full`); production uses Postgres. Both
> expose the same `/api` so the frontend is identical in both environments.

## Features
- **Board view** — sidebar, search, status filters, sort, summary cards, pastel sticky-note grid with folded-corner effect.
- **Inline status popover** — click a note's status badge (or its title) to change status instantly via a floating popover; no edit form needed. Closes on outside click / Escape, keyboard navigable (↑/↓ + Enter).
- **Checklists** — toggle items directly on the card; full builder in the form (add / edit / delete / reorder / check).
- **Add & Edit** — right-side slide-over panel with title, description, status, tag, checklist, color, reminder, favorite.
- **Delete flow** — confirmation modal → moves to Corbeille → toast with **Annuler** (undo).
- **Favorites, pin, archive, color change, trash + restore.**
- **Floating widget** — draggable + resizable (drag the bottom-right corner) compact panel with recent notes & checklists.
- **Persistence** — users and notes are stored server-side in SQLite (see Backend above); the app hydrates from the API on startup.

## Data model
See [src/types.ts](src/types.ts) — `Note`, `ChecklistItem`, `NoteStatus` (`todo` / `in_progress` / `done`).
