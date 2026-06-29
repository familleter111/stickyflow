# StickyFlow 📝

A modern, SaaS-style Sticky Notes app inspired by Microsoft Sticky Notes — with inline status changes, in-card checklists, and a resizable floating desktop-style widget.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · Zustand · lucide-react · localStorage persistence

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview the build
```

## Features
- **Board view** — sidebar, search, status filters, sort, summary cards, pastel sticky-note grid with folded-corner effect.
- **Inline status popover** — click a note's status badge (or its title) to change status instantly via a floating popover; no edit form needed. Closes on outside click / Escape, keyboard navigable (↑/↓ + Enter).
- **Checklists** — toggle items directly on the card; full builder in the form (add / edit / delete / reorder / check).
- **Add & Edit** — right-side slide-over panel with title, description, status, tag, checklist, color, reminder, favorite.
- **Delete flow** — confirmation modal → moves to Corbeille → toast with **Annuler** (undo).
- **Favorites, pin, archive, color change, trash + restore.**
- **Floating widget** — draggable + resizable (drag the bottom-right corner) compact panel with recent notes & checklists.
- **Persistence** — notes live in `localStorage` (`stickyflow.notes.v1`); demo notes seed on first load only.

## Data model
See [src/types.ts](src/types.ts) — `Note`, `ChecklistItem`, `NoteStatus` (`todo` / `in_progress` / `done`).
