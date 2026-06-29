// Vercel serverless function: GET (list) / PUT (replace all) users.
import { ensureSchema, getUsers, replaceUsers } from "../lib/db.mjs";

export default async function handler(req, res) {
  try {
    await ensureSchema();
    if (req.method === "GET") {
      return res.status(200).json(await getUsers());
    }
    if (req.method === "PUT") {
      await replaceUsers(req.body);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("[api/users]", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
