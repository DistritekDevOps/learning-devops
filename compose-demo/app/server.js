const http = require("http");
const os = require("os");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;

// Semua kredensial datang dari environment variable yang disetel
// di compose.yaml — tidak ada yang di-hardcode di dalam image
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "demo",
  password: process.env.DB_PASSWORD || "rahasia",
  database: process.env.DB_NAME || "demo",
});

// Tunggu database siap, lalu siapkan tabel
async function initDb(retries = 15) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS kunjungan (
          id SERIAL PRIMARY KEY,
          waktu TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("Database siap.");
      return;
    } catch (err) {
      console.log(`Database belum siap (percobaan ${i}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Gagal terhubung ke database.");
}

const server = http.createServer(async (req, res) => {
  if (req.url !== "/") {
    res.writeHead(404).end("Not Found");
    return;
  }

  try {
    await pool.query("INSERT INTO kunjungan DEFAULT VALUES");
    const { rows } = await pool.query(
      "SELECT count(*)::int AS total, max(waktu) AS terakhir FROM kunjungan"
    );
    const { total, terakhir } = rows[0];

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compose Demo — Distritek DevOps</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #451a03 0%, #7c2d12 60%, #1c1917 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 3rem;
      max-width: 560px;
      width: 100%;
      backdrop-filter: blur(10px);
      text-align: center;
    }
    .logo { font-size: 3.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #ffffff; }
    .subtitle { color: #fdba74; margin-bottom: 2rem; }
    .counter {
      font-size: 4rem;
      font-weight: 700;
      color: #fb923c;
      margin-bottom: 0.25rem;
    }
    .counter-label { color: #94a3b8; margin-bottom: 2rem; }
    ul { list-style: none; text-align: left; }
    li {
      padding: 0.75rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    li span:first-child { color: #94a3b8; }
    code {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    footer { margin-top: 2rem; font-size: 0.8rem; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🐘</div>
    <h1>Node.js + PostgreSQL</h1>
    <p class="subtitle">Dua container, satu perintah: <code>docker compose up</code></p>

    <div class="counter">${total}</div>
    <div class="counter-label">total kunjungan — tersimpan di database, refresh untuk menambah</div>

    <ul>
      <li><span>Container aplikasi</span> <code>${os.hostname()}</code></li>
      <li><span>Database host</span> <code>${process.env.DB_HOST}</code> (nama service)</li>
      <li><span>Kunjungan terakhir</span> <code>${new Date(terakhir).toLocaleTimeString("id-ID")}</code></li>
    </ul>

    <footer>Data tetap ada walau container dihapus — coba <code>compose down</code> lalu <code>up</code> lagi.</footer>
  </div>
</body>
</html>`;

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Gagal mengakses database: ${err.message}`);
  }
});

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
});
