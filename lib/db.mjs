// Shared database layer for the Vercel serverless API (/api/*).
//
// Uses @vercel/postgres, which reads the POSTGRES_URL env var that Vercel
// sets automatically when you attach a Postgres (Neon) database to the
// project. The schema is created and seeded lazily on the first request,
// so no manual migration step is required.
import { sql } from "@vercel/postgres";

const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

export const SEED_USERS = [
  { id: "u_admin", email: "admin@email.com", username: "Admin", password: "Admin1234?", status: "active", role: "admin", createdAt: daysAgo(120), updatedAt: daysAgo(120) },
  { id: "u_marie", email: "marie@email.com", username: "marie", password: "marie123", status: "active", role: "user", createdAt: daysAgo(60), updatedAt: daysAgo(12) },
  { id: "u_lucas", email: "lucas@email.com", username: "lucas", password: "lucas123", status: "active", role: "user", createdAt: daysAgo(30), updatedAt: daysAgo(5) },
  { id: "u_sophie", email: "sophie@email.com", username: "sophie", password: "sophie123", status: "inactive", role: "user", createdAt: daysAgo(8), updatedAt: daysAgo(2) },
];

let ready;

/** Create tables (if missing) and seed default accounts once. */
export function ensureSchema() {
  if (!ready) ready = init();
  return ready;
}

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          text PRIMARY KEY,
      email       text UNIQUE NOT NULL,
      username    text NOT NULL,
      password    text NOT NULL,
      status      text NOT NULL,
      role        text NOT NULL,
      "createdAt" text NOT NULL,
      "updatedAt" text NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id           text PRIMARY KEY,
      "userId"     text NOT NULL,
      title        text NOT NULL DEFAULT '',
      content      text NOT NULL DEFAULT '',
      status       text NOT NULL,
      color        text NOT NULL,
      tag          text NOT NULL DEFAULT '',
      "isFavorite" boolean NOT NULL DEFAULT false,
      "isPinned"   boolean NOT NULL DEFAULT false,
      "isArchived" boolean NOT NULL DEFAULT false,
      "isDeleted"  boolean NOT NULL DEFAULT false,
      "reminderAt" text,
      checklist    jsonb NOT NULL DEFAULT '[]'::jsonb,
      "createdAt"  text NOT NULL,
      "updatedAt"  text NOT NULL
    )`;

  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM users`;
  if (rows[0].n === 0) {
    for (const u of SEED_USERS) {
      await sql`
        INSERT INTO users (id, email, username, password, status, role, "createdAt", "updatedAt")
        VALUES (${u.id}, ${u.email}, ${u.username}, ${u.password}, ${u.status}, ${u.role}, ${u.createdAt}, ${u.updatedAt})`;
    }
  }
}

export { sql };

const nowISO = () => new Date().toISOString();

/* ----------------------------- users ----------------------------- */

export async function getUsers() {
  const { rows } = await sql`SELECT * FROM users ORDER BY "createdAt" ASC`;
  return rows;
}

/** Replace the whole user list inside a transaction. */
export async function replaceUsers(users) {
  const list = Array.isArray(users) ? users : [];
  const client = await sql.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM users");
    for (const u of list) {
      await client.query(
        `INSERT INTO users (id, email, username, password, status, role, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [u.id, u.email, u.username, u.password, u.status, u.role, u.createdAt ?? nowISO(), u.updatedAt ?? nowISO()],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* ----------------------------- notes ----------------------------- */

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
    checklist: Array.isArray(r.checklist) ? r.checklist : [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function getNotes() {
  const { rows } = await sql`SELECT * FROM notes`;
  return rows.map(noteFromRow);
}

export async function replaceNotes(notes) {
  const list = Array.isArray(notes) ? notes : [];
  const client = await sql.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM notes");
    for (const n of list) {
      await client.query(
        `INSERT INTO notes
          (id, "userId", title, content, status, color, tag,
           "isFavorite", "isPinned", "isArchived", "isDeleted", "reminderAt", checklist, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          n.id, n.userId, n.title ?? "", n.content ?? "", n.status, n.color, n.tag ?? "",
          !!n.isFavorite, !!n.isPinned, !!n.isArchived, !!n.isDeleted,
          n.reminderAt ?? null, JSON.stringify(n.checklist ?? []),
          n.createdAt ?? nowISO(), n.updatedAt ?? nowISO(),
        ],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* ----------------------------- login ----------------------------- */

export async function findUserByEmail(email) {
  const { rows } = await sql`SELECT * FROM users WHERE lower(email) = lower(${email})`;
  return rows[0] ?? null;
}
