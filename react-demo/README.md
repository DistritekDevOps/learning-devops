# React Demo — Aplikasi React 3 Halaman

Aplikasi contoh untuk [materi dasar Docker](../docker.md): aplikasi React (Vite + React Router) dengan 3 halaman — **Beranda**, **Materi**, dan **Tentang** — yang di-build dan di-serve sepenuhnya lewat **multi-stage build** (bagian 4 materi).

Alur build-nya:

1. **Stage 1** (`node:22-alpine`) — install dependensi dengan `npm ci`, lalu `npm run build` menghasilkan file statis di `dist/`.
2. **Stage 2** (`nginx:alpine`) — hanya menyalin `dist/` dan konfigurasi Nginx. Image akhir tidak berisi Node.js maupun `node_modules`, sehingga ukurannya kecil.

File [nginx.conf](nginx.conf) berisi `try_files ... /index.html` agar route React seperti `/materi` tetap bekerja saat di-refresh atau dibuka langsung (client-side routing).

## Struktur

```
react-demo/
├── Dockerfile          # Multi-stage build: Node (build) -> Nginx (serve)
├── nginx.conf          # Fallback SPA untuk React Router
├── .dockerignore
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx        # Entry point + BrowserRouter
    ├── App.jsx         # Layout, navbar, dan definisi route
    ├── index.css
    └── pages/
        ├── Beranda.jsx # Halaman utama + tombol counter interaktif
        ├── Materi.jsx  # Daftar topik materi
        └── Tentang.jsx # Penjelasan multi-stage build
```

## Cara Menjalankan dengan Container

Panduan ini menggunakan Docker. Podman mendukung banyak perintah serupa, tetapi jaringan, permission, dan penyedia Compose dapat berbeda. Tidak perlu install Node.js di mesin — semua proses build terjadi di dalam container.

```bash
# 1. Build image (jalankan dari folder react-demo)
docker build -t react-demo .

# 2. Jalankan container: port 8081 host -> port 80 container
docker run -d --name react-demo -p 127.0.0.1:8081:80 react-demo

# 3. Buka di browser
# Buka di browser: http://localhost:8081
```

## Development Tanpa Container

```bash
npm install
npm run dev     # buka http://localhost:5173
```

## Hal yang Bisa Diamati

- **Perpindahan halaman instan** — klik menu Beranda/Materi/Tentang; tidak ada reload karena routing terjadi di browser.
- **Refresh di route dalam** — buka `http://localhost:8081/materi` langsung lalu refresh; tetap bekerja berkat fallback di `nginx.conf`. Coba hapus baris `try_files`-nya dan build ulang untuk melihat error 404.
- **Ukuran image** — bandingkan `docker images`: catat ukuran image runtime pada mesin Anda. Ukuran bergantung base image, platform, dan aset; jangan mengasumsikan angka tetap.

## Bersih-bersih

```bash
docker rm -f react-demo
docker rmi react-demo
```

## Panduan praktik terstruktur

Lihat [praktik-docker.md](../praktik-docker.md) untuk urutan latihan, hasil yang diharapkan, troubleshooting, dan cleanup.
