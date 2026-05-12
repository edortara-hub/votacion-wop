// API para guardar/leer votos
// Usa JSONBin.io (gratis, sin base de datos)
// Configura las variables en Vercel: JSONBIN_ID y JSONBIN_KEY

const JSONBIN_ID = process.env.JSONBIN_ID;
const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

async function readVotos() {
  const r = await fetch(`${JSONBIN_URL}/latest`, {
    headers: { "X-Master-Key": JSONBIN_KEY }
  });
  if (!r.ok) return {};
  const data = await r.json();
  return data.record?.votos || {};
}

async function writeVotos(votos) {
  const r = await fetch(JSONBIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_KEY
    },
    body: JSON.stringify({ votos })
  });
  return r.ok;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const votos = await readVotos();
      return res.status(200).json(votos);
    }

    if (req.method === "POST") {
      const { nombre, voto } = req.body || {};
      if (!nombre || !voto) return res.status(400).json({ error: "Faltan datos" });
      const votos = await readVotos();
      votos[nombre] = voto;
      const ok = await writeVotos(votos);
      if (!ok) return res.status(500).json({ error: "Error al guardar" });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const nombre = req.query.nombre;
      if (!nombre) return res.status(400).json({ error: "Falta nombre" });
      const votos = await readVotos();
      delete votos[nombre];
      const ok = await writeVotos(votos);
      if (!ok) return res.status(500).json({ error: "Error al borrar" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
