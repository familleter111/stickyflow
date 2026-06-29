// MDFlow backend — a tiny REST API backed by a real SQLite database.
//
// Uses Node's built-in SQLite (node:sqlite, Node >= 22), so there is no
// native module to compile. The database file lives at server/mdflow.db.
//
// Run with:  npm run server   (or  node server/server.mjs)
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import express from "express";
import cors from "cors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "mdflow.db");
const PORT = process.env.PORT || 3001;

/* ------------------------------------------------------------------ *
 * Database
 * ------------------------------------------------------------------ */
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        TEXT PRIMARY KEY,
    email     TEXT UNIQUE NOT NULL,
    username  TEXT NOT NULL,
    password  TEXT NOT NULL,
    status    TEXT NOT NULL,
    role      TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id         TEXT PRIMARY KEY,
    userId     TEXT NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    status     TEXT NOT NULL,
    color      TEXT NOT NULL,
    tag        TEXT NOT NULL,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    isPinned   INTEGER NOT NULL DEFAULT 0,
    isArchived INTEGER NOT NULL DEFAULT 0,
    isDeleted  INTEGER NOT NULL DEFAULT 0,
    reminderAt TEXT,
    checklist  TEXT NOT NULL DEFAULT '[]',
    createdAt  TEXT NOT NULL,
    updatedAt  TEXT NOT NULL
  );
`);

/* ------------------------------------------------------------------ *
 * Seed: make sure the built-in accounts exist on first run so login
 * works out of the box. Matches the ids/credentials the app shipped with.
 * ------------------------------------------------------------------ */
const nowISO = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

const SEED_USERS = [
  { id: "u_admin", email: "admin@email.com", username: "Admin", password: "Admin1234?", status: "active", role: "admin", createdAt: daysAgo(120), updatedAt: daysAgo(120) },
  { id: "u_marie", email: "marie@email.com", username: "marie", password: "marie123", status: "active", role: "user", createdAt: daysAgo(60), updatedAt: daysAgo(12) },
  { id: "u_lucas", email: "lucas@email.com", username: "lucas", password: "lucas123", status: "active", role: "user", createdAt: daysAgo(30), updatedAt: daysAgo(5) },
  { id: "u_sophie", email: "sophie@email.com", username: "sophie", password: "sophie123", status: "inactive", role: "user", createdAt: daysAgo(8), updatedAt: daysAgo(2) },
];

const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (userCount === 0) {
  const insert = db.prepare(
    `INSERT INTO users (id, email, username, password, status, role, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const u of SEED_USERS) {
    insert.run(u.id, u.email, u.username, u.password, u.status, u.role, u.createdAt, u.updatedAt);
  }
  console.log(`[mdflow] seeded ${SEED_USERS.length} default users`);
}

/* ------------------------------------------------------------------ *
 * Row <-> JSON helpers
 * ------------------------------------------------------------------ */
function noteFromRow(r) {
  return {
    id: r.id,
    userId: r.userId,
    title: r.title,
    content: r.content,
    status: r.status,
    color: r.color,
    tag: r.tag,
    isFavorite: !!r.isFavorite,
    isPinned: !!r.isPinned,
    isArchived: !!r.isArchived,
    isDeleted: !!r.isDeleted,
    reminderAt: r.reminderAt ?? null,
    checklist: safeParse(r.checklist, []),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function safeParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ *
 * REST API
 * ------------------------------------------------------------------ */
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// --- Users ----------------------------------------------------------
app.get("/api/users", (_req, res) => {
  const rows = db.prepare("SELECT * FROM users ORDER BY createdAt ASC").all();
  res.json(rows);
});

// Replace the whole user list (mirrors the app's "save all" model).
app.put("/api/users", (req, res) => {
  const users = Array.isArray(req.body) ? req.body : [];
  try {
    db.exec("BEGIN");
    db.prepare("DELETE FROM users").run();
    const insert = db.prepare(
      `INSERT INTO users (id, email, username, password, status, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const u of users) {
      insert.run(
        u.id, u.email, u.username, u.password, u.status, u.role,
        u.createdAt ?? nowISO(), u.updatedAt ?? nowISO(),
      );
    }
    db.exec("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch { /* no active txn */ }
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// --- Notes ----------------------------------------------------------
app.get("/api/notes", (_req, res) => {
  const rows = db.prepare("SELECT * FROM notes").all();
  res.json(rows.map(noteFromRow));
});

// Replace the whole notes collection.
app.put("/api/notes", (req, res) => {
  const notes = Array.isArray(req.body) ? req.body : [];
  try {
    db.exec("BEGIN");
    db.prepare("DELETE FROM notes").run();
    const insert = db.prepare(
      `INSERT INTO notes
        (id, userId, title, content, status, color, tag,
         isFavorite, isPinned, isArchived, isDeleted, reminderAt, checklist, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const n of notes) {
      insert.run(
        n.id, n.userId, n.title ?? "", n.content ?? "", n.status, n.color, n.tag ?? "",
        n.isFavorite ? 1 : 0, n.isPinned ? 1 : 0, n.isArchived ? 1 : 0, n.isDeleted ? 1 : 0,
        n.reminderAt ?? null, JSON.stringify(n.checklist ?? []),
        n.createdAt ?? nowISO(), n.updatedAt ?? nowISO(),
      );
    }
    db.exec("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch { /* no active txn */ }
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// --- Login (authoritative check against the database) ---------------
app.post("/api/login", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "").trim();
  const user = db
    .prepare("SELECT * FROM users WHERE lower(email) = ?")
    .get(email);
  if (!user || String(user.password).trim() !== password) {
    return res.json({ ok: false, error: "Email ou mot de passe incorrect." });
  }
  if (user.status === "inactive") {
    return res.json({
      ok: false,
      error: "Votre compte est désactivé. Veuillez contacter l'administrateur.",
    });
  }
  res.json({ ok: true, user });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[mdflow] API listening on http://localhost:${PORT}  (db: ${DB_PATH})`);
});
