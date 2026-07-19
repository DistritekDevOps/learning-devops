# Docker Demo — Halaman Web Sederhana

Aplikasi contoh untuk [materi dasar Docker](../docker.md): sebuah halaman HTML statis yang di-serve oleh Nginx di dalam container.

## Struktur

```
docker-demo/
├── Dockerfile     # Instruksi build image
├── index.html     # Halaman web yang di-serve
└── README.md
```

## Cara Menjalankan

Perintah di bawah memakai `docker`, tapi bisa diganti `podman` — sintaksnya sama persis.

```bash
# 1. Build image (jalankan dari folder docker-demo)
docker build -t docker-demo .

# 2. Jalankan container: port 8080 host -> port 80 container
docker run -d --name demo -p 8080:80 docker-demo

# 3. Buka di browser
open http://localhost:8080
```

## Perintah Berguna Lainnya

```bash
# Lihat container yang berjalan
docker ps

# Lihat log akses Nginx
docker logs -f demo

# Masuk ke dalam container
docker exec -it demo sh

# Hentikan dan hapus container
docker rm -f demo

# Hapus image
docker rmi docker-demo
```

## Eksperimen

- Ubah isi `index.html`, lalu build dan jalankan ulang — perubahan baru terlihat setelah image di-build ulang, karena file *disalin* ke dalam image saat build.
- Untuk development tanpa build ulang, gunakan bind mount sehingga perubahan file langsung terlihat:

  ```bash
  docker run -d --name demo-dev -p 8081:80 \
    -v $(pwd)/index.html:/usr/share/nginx/html/index.html:ro \
    nginx:alpine
  ```
