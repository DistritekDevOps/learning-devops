# Node Demo — Aplikasi Node.js Sederhana

Aplikasi contoh untuk [materi dasar Docker](../docker.md): server Node.js yang menghasilkan halaman **dinamis** — menampilkan hostname container, versi Node, dan uptime. Bandingkan dengan [docker-demo](../docker-demo/) yang halamannya statis.

Aplikasi ini sengaja tanpa dependensi eksternal (memakai modul `http` bawaan Node) agar build cepat. Untuk aplikasi nyata dengan dependensi, ikuti pola layer cache di bagian 4 materi (`COPY package*.json` → `RUN npm ci` → `COPY . .`).

## Struktur

```
node-demo/
├── Dockerfile        # Instruksi build image
├── .dockerignore     # File yang tidak ikut ke build context
├── package.json      # Metadata aplikasi
├── server.js         # Server HTTP + halaman dinamis
└── README.md
```

## Cara Menjalankan

Perintah di bawah memakai `docker`, tapi bisa diganti `podman` — sintaksnya sama persis.

```bash
# 1. Build image (jalankan dari folder node-demo)
docker build -t node-demo .

# 2. Jalankan container: port 3000 host -> port 3000 container
docker run -d --name node-demo -p 3000:3000 node-demo

# 3. Buka di browser
open http://localhost:3000

# Endpoint JSON
curl http://localhost:3000/api/info
```

## Hal yang Bisa Diamati

- **Hostname** di halaman adalah ID container — jalankan container kedua di port lain (`-p 3001:3000`) dan bandingkan: satu image, dua container berbeda.
- **Uptime** bertambah setiap refresh — bukti halaman dibuat dinamis oleh server, bukan file statis.
- **Log request** muncul di `docker logs -f node-demo` setiap halaman dibuka.
- **Port via environment variable** — jalankan dengan `-e PORT=4000` untuk mengubah port di dalam container.

## Bersih-bersih

```bash
docker rm -f node-demo
docker rmi node-demo
```
