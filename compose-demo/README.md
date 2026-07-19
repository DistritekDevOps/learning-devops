# Compose Demo — Node.js + PostgreSQL

Aplikasi contoh untuk bagian 7 (Docker Compose) di [materi dasar Docker](../docker.md): **dua container** — aplikasi Node.js dan database PostgreSQL — dijalankan sekaligus dengan satu perintah. Aplikasinya sebuah counter kunjungan: setiap refresh menambah baris di database, dan datanya **tetap ada** walau container dihapus.

Konsep materi yang dipraktikkan sekaligus di demo ini:

- **Multi-container** — service `app` dan `db` didefinisikan di [compose.yaml](compose.yaml).
- **Environment variable** — kredensial database disetel lewat `environment:`, dibaca aplikasi via `process.env` ([app/server.js](app/server.js)); tidak ada yang di-hardcode di image.
- **Network otomatis** — aplikasi terhubung ke database dengan host `db` (nama service), bukan IP.
- **Named volume** — data PostgreSQL disimpan di volume `dbdata`, selamat dari `compose down`.
- **`depends_on` + healthcheck** — aplikasi baru dijalankan setelah database benar-benar siap menerima koneksi.

## Struktur

```
compose-demo/
├── compose.yaml        # Definisi service app + db, volume, healthcheck
├── README.md
└── app/
    ├── Dockerfile      # Build image aplikasi (dengan npm ci)
    ├── package.json    # Dependensi: pg (client PostgreSQL)
    ├── server.js       # Counter kunjungan yang membaca/menulis database
    └── .dockerignore
```

## Cara Menjalankan

Perintah di bawah memakai `docker compose`, ganti dengan `podman compose` jika memakai Podman — sintaksnya sama persis.

```bash
# Jalankan semua service (build otomatis saat pertama kali)
docker compose up -d

# Buka di browser — refresh beberapa kali, lihat counter bertambah
open http://localhost:3001
```

## Perintah Berguna

```bash
docker compose ps            # Status semua service
docker compose logs -f app   # Log aplikasi (termasuk retry koneksi db)
docker compose exec db psql -U demo -d demo -c "SELECT count(*) FROM kunjungan;"
docker compose down          # Hentikan dan hapus container (volume tetap ada)
docker compose down -v       # Sekaligus hapus volume (data hilang, hati-hati!)
```

## Eksperimen: Buktikan Data Persisten

```bash
# 1. Refresh halaman beberapa kali, catat angka counter
# 2. Hapus semua container
docker compose down

# 3. Jalankan lagi
docker compose up -d

# 4. Buka http://localhost:3001 — counter melanjutkan angka sebelumnya,
#    karena data tersimpan di named volume, bukan di dalam container.

# Bandingkan dengan:
docker compose down -v   # volume ikut terhapus
docker compose up -d     # counter mulai dari 1 lagi
```
