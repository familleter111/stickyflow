// Vercel serverless function: GET (list) / PUT (replace all) notes.
import { ensureSchema, getNotes, replaceNotes } from "../lib/db.mjs";

export default async function handler(req, res) {
  try {
    await ensureSchema();
    if (req.method === "GET") {
      return res.status(200).json(await getNotes());
    }
    if (req.method === "PUT") {
      await replaceNotes(req.body);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("[api/notes]", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
