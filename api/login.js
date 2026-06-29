// Vercel serverless function: authenticate a user against the database.
import { ensureSchema, findUserByEmail } from "../lib/db.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  try {
    await ensureSchema();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "").trim();

    const user = await findUserByEmail(email);
    if (!user || String(user.password).trim() !== password) {
      return res.status(200).json({ ok: false, error: "Email ou mot de passe incorrect." });
    }
    if (user.status === "inactive") {
      return res.status(200).json({
        ok: false,
        error: "Votre compte est désactivé. Veuillez contacter l'administrateur.",
      });
    }
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error("[api/login]", err);
    return res.status(500).json({ ok: false, error: "Serveur indisponible. Réessayez." });
  }
}
