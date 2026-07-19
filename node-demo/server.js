const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 3000;

function formatUptime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m} menit ${s} detik` : `${s} detik`;
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  // Endpoint JSON, contoh API sederhana
  if (req.url === "/api/info") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        hostname: os.hostname(),
        platform: `${os.platform()} ${os.arch()}`,
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
      })
    );
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node Demo — Distritek DevOps</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #14532d 0%, #166534 60%, #1a2e05 100%);
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
    }
    .logo { font-size: 3.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #ffffff; }
    .subtitle { color: #a7f3d0; margin-bottom: 2rem; }
    ul { list-style: none; }
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
    a { color: #6ee7b7; }
    footer { margin-top: 2rem; font-size: 0.8rem; color: #86efac; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🟢</div>
    <h1>Halo dari Node.js!</h1>
    <p class="subtitle">Halaman ini dibuat secara dinamis oleh server Node.js di dalam container.</p>

    <ul>
      <li><span>Hostname (ID container)</span> <code>${os.hostname()}</code></li>
      <li><span>Versi Node</span> <code>${process.version}</code></li>
      <li><span>Platform</span> <code>${os.platform()} ${os.arch()}</code></li>
      <li><span>Uptime server</span> <code>${formatUptime(process.uptime())}</code></li>
      <li><span>Waktu server</span> <code>${new Date().toLocaleTimeString("id-ID")}</code></li>
    </ul>

    <footer>Coba juga endpoint JSON: <a href="/api/info">/api/info</a> — refresh halaman untuk lihat uptime berubah.</footer>
  </div>
</body>
</html>`;

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
