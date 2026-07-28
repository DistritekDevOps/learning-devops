# Materi Dasar Docker

Materi ini membahas dasar-dasar Docker untuk kebutuhan DevOps, mulai dari konsep container, perintah dasar, membuat image dengan Dockerfile, hingga menjalankan multi-container dengan Docker Compose.

---

## 1. Pengenalan Docker

Docker adalah platform untuk membungkus aplikasi beserta dependensi runtime-nya ke dalam sebuah **container** — unit yang ringan dan portabel. Image yang sama membantu menghasilkan environment aplikasi yang konsisten, selama platform CPU, kernel, konfigurasi runtime, dan layanan eksternalnya kompatibel.

Masalah yang dibantu diselesaikan Docker: *"di laptop saya jalan, di server kok error?"* Dengan container, versi bahasa dan library dapat dikemas bersama aplikasi sehingga perbedaan environment antar mesin berkurang. Konfigurasi runtime, secret, volume, jaringan, kernel host, dan arsitektur CPU tetap perlu dikelola.

Beberapa istilah penting:

- **Image** — template/cetakan aplikasi yang bersifat read-only. Dibuat dari `Dockerfile`.
- **Container** — instance yang berjalan dari sebuah image. Satu image bisa dijalankan menjadi banyak container.
- **Dockerfile** — file berisi instruksi untuk membangun image.
- **Registry** — tempat menyimpan dan membagikan image, contohnya [Docker Hub](https://hub.docker.com).
- **Docker Engine / Daemon** — service di background yang mengelola image dan container.

### Container vs Virtual Machine

| Aspek | Container | Virtual Machine |
|---|---|---|
| Ukuran | Umumnya MB hingga beberapa GB | Umumnya beberapa hingga puluhan GB |
| Waktu start | Umumnya detik atau kurang | Umumnya detik hingga menit |
| OS | Berbagi kernel host | Membawa OS lengkap sendiri |
| Isolasi | Level proses | Level hardware (lebih kuat) |

Container jauh lebih ringan karena tidak membawa OS lengkap — hanya aplikasi dan dependensinya, berbagi kernel dengan host.

---

## 2. Instalasi Docker

### Ubuntu / Debian

```bash
# Update paket dan pasang dependensi
sudo apt update
sudo apt install -y ca-certificates curl

# Tentukan distribusi dan codename
. /etc/os-release
case "$ID" in
  ubuntu|debian) DOCKER_DISTRO="$ID" ;;
  *) echo "Distribusi ini tidak didukung oleh contoh ini: $ID"; exit 1 ;;
esac
DOCKER_CODENAME="${UBUNTU_CODENAME:-$VERSION_CODENAME}"

# Tambahkan GPG key resmi Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL "https://download.docker.com/linux/$DOCKER_DISTRO/gpg" \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Tambahkan repository Docker
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/$DOCKER_DISTRO
Suites: $DOCKER_CODENAME
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# Install Docker Engine + plugin compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Agar bisa menjalankan `docker` tanpa `sudo`:

```bash
sudo usermod -aG docker $USER
# Logout lalu login kembali agar grup aktif
```


sudo usermod -aG docker NAMA_USER_SSH

> ⚠️ Anggota grup `docker` memiliki akses setingkat root melalui Docker daemon. Berikan akses hanya kepada user tepercaya. Untuk isolasi lebih kuat, pertimbangkan [Rootless mode](https://docs.docker.com/engine/security/rootless/).

Verifikasi instalasi:

```bash
docker --version
docker run hello-world
```

### macOS / Windows

Gunakan **Docker Desktop** — unduh dari https://www.docker.com/products/docker-desktop, install, lalu jalankan aplikasinya. Perintah `docker` otomatis tersedia di terminal.

---

## 3. Perintah Dasar Docker

### Mengelola Image

```bash
# Mengunduh image dari Docker Hub
docker pull nginx

# Mengunduh versi (tag) tertentu
docker pull nginx:1.27-alpine

# Melihat daftar image di lokal
docker images

# Menghapus image
docker rmi nginx
```

### Menjalankan Container

```bash
# Menjalankan container secara interaktif (masuk ke shell-nya)
docker run -it ubuntu bash

# Menjalankan di background (detached) dengan nama
docker run -d --name webserver nginx

# Memetakan port: port 8080 host -> port 80 container
docker run -d -p 8080:80 nginx

# Menyetel environment variable
docker run -d -e MYSQL_ROOT_PASSWORD=rahasia mysql:8

# Container otomatis terhapus saat berhenti
docker run --rm -it alpine sh
```

### Mengelola Container

```bash
# Melihat container yang sedang berjalan
docker ps

# Melihat semua container (termasuk yang sudah berhenti)
docker ps -a

# Menghentikan / menjalankan ulang container
docker stop webserver
docker start webserver
docker restart webserver

# Menghapus container (harus stop dulu, atau paksa dengan -f)
docker rm webserver
docker rm -f webserver

# Melihat log container
docker logs webserver
docker logs -f webserver        # follow, seperti tail -f

# Masuk ke dalam container yang sedang berjalan
docker exec -it webserver bash

docker exec -it webserver sh

# Melihat detail konfigurasi container
docker inspect webserver

# Melihat penggunaan CPU/memori container
docker stats
```

### Bersih-bersih

```bash
# Menghapus semua container yang sudah berhenti
docker container prune

# Menghapus dangling image (layer/image tanpa tag yang tidak direferensikan)
docker image prune

# Menghapus semua image yang tidak dipakai container
docker image prune -a

# Menghapus container, image, network, dan build cache yang tidak terpakai
# Volume tidak ikut dihapus kecuali opsi --volumes ditambahkan
docker system prune -a
```

---

## 4. Membuat Image dengan Dockerfile

`Dockerfile` berisi instruksi langkah demi langkah untuk membangun image. Contoh untuk aplikasi Node.js:

```dockerfile
# Image dasar
FROM node:22-alpine

# Direktori kerja di dalam container
WORKDIR /app

# Salin file dependensi dulu (memanfaatkan layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Salin sisa kode aplikasi
COPY --chown=node:node . .

# Dokumentasi port yang dipakai aplikasi
EXPOSE 3000

# Jalankan proses aplikasi sebagai user non-root bawaan image Node.js
USER node

# Perintah saat container dijalankan
CMD ["node", "server.js"]
```

Instruksi yang paling sering dipakai:

- **`FROM`** — image dasar dan wajib untuk memulai build stage. `ARG`, komentar, atau parser directive dapat ditulis sebelum `FROM`.
- **`WORKDIR`** — direktori kerja untuk instruksi berikutnya.
- **`COPY`** — menyalin file dari host ke image.
- **`RUN`** — menjalankan perintah saat *build* (install dependensi, dll).
- **`ENV`** — menyetel environment variable.
- **`EXPOSE`** — dokumentasi port yang digunakan aplikasi.
- **`CMD`** — perintah default saat container *dijalankan* (hanya satu, yang terakhir yang berlaku).
- **`ENTRYPOINT`** — mirip `CMD`, tapi tidak mudah di-override; sering dikombinasikan dengan `CMD` sebagai argumen default.

Build dan jalankan:

```bash
# Build image dengan nama myapp dan tag 1.0 (titik = konteks build)
docker build -t myapp:1.0 .

# Jalankan
docker run -d -p 3000:3000 --name myapp myapp:1.0
```

### .dockerignore

Seperti `.gitignore`, mencegah file yang tidak perlu ikut ke dalam build context:

```
node_modules
.git
.env
secrets/
*.log
```

### Multi-stage Build

Untuk menghasilkan image akhir yang kecil — proses build dilakukan di stage pertama, hasilnya saja yang disalin ke stage akhir:

```dockerfile
# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: image akhir yang ramping
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 5. Volume (Penyimpanan Data)

Data di dalam container **hilang saat container dihapus**. Volume digunakan agar data tetap tersimpan (persisten).

```bash
# Membuat named volume
docker volume create dbdata

# Menggunakan volume untuk data MySQL
docker run -d --name db \
  -e MYSQL_ROOT_PASSWORD=rahasia \
  -v dbdata:/var/lib/mysql \
  mysql:8

# Bind mount: memetakan folder host ke container (cocok untuk development)
docker run -d -p 8080:80 \
  --mount type=bind,source="$(pwd)/html",target=/usr/share/nginx/html \
  nginx

# Melihat dan menghapus volume
docker volume ls
docker volume rm dbdata
```

Perbedaan:

- **Named volume** — dikelola Docker, cocok untuk data produksi (database, upload).
- **Bind mount** — folder host langsung dipetakan ke container, cocok untuk development (edit kode langsung terlihat di container).

---

## 6. Network (Jaringan Antar Container)

Container dalam **user-defined network** yang sama bisa saling terhubung menggunakan nama container sebagai hostname. Automatic DNS berdasarkan nama tidak tersedia dengan cara yang sama pada default bridge network.

```bash
# Membuat network
docker network create mynet

# Jalankan database di network tersebut
docker run -d --name db --network mynet \
  -e MYSQL_ROOT_PASSWORD=rahasia mysql:8

# Aplikasi bisa mengakses database dengan host "db" (bukan IP)
docker run -d --name app --network mynet \
  -e DB_HOST=db -p 3000:3000 myapp:1.0

# Melihat daftar network
docker network ls
```

---

## 7. Docker Compose

Docker Compose mendefinisikan banyak container (aplikasi + database + cache, dll) dalam satu file `compose.yaml` (atau `docker-compose.yml`), lalu menjalankannya dengan satu perintah.

Contoh: aplikasi web + MySQL:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_USER: myapp
      # Aplikasi contoh harus membaca password dari file ini.
      DB_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MYSQL_DATABASE: myapp
      MYSQL_USER: myapp
      MYSQL_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_root_password
      - db_password
    volumes:
      - dbdata:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u root -p$$(cat /run/secrets/db_root_password) --silent"]
      interval: 10s
      timeout: 5s
      start_period: 30s
      retries: 5
    restart: unless-stopped

volumes:
  dbdata:

secrets:
  db_root_password:
    file: ./secrets/db_root_password.txt
  db_password:
    file: ./secrets/db_password.txt
```

Compose otomatis membuat network bersama, sehingga service bisa saling akses lewat namanya (`app` mengakses database dengan host `db`). Pada contoh ini, Compose juga menunggu healthcheck database berhasil sebelum memulai `app`.

File di folder `secrets/` harus dibuat dengan izin akses terbatas dan tidak boleh dimasukkan ke version control. Dukungan variabel berakhiran `_FILE` tersedia pada image MySQL; aplikasi buatan sendiri perlu mengimplementasikan pembacaan secret dari file.

Perintah utama:

```bash
# Menjalankan semua service di background
docker compose up -d

# Build ulang image lalu jalankan
docker compose up -d --build

# Melihat status dan log
docker compose ps
docker compose logs -f app

# Masuk ke salah satu service
docker compose exec app sh

# Menghentikan dan menghapus semua container
docker compose down

# Sekaligus menghapus volume (data ikut hilang, hati-hati!)
docker compose down -v
```

---

## 8. Publikasi Image ke Registry

```bash
# Login ke Docker Hub
docker login

# Beri tag sesuai username Docker Hub
docker tag myapp:1.0 username/myapp:1.0

# Upload ke Docker Hub
docker push username/myapp:1.0

# Di server lain, tinggal pull dan jalankan
docker pull username/myapp:1.0
docker run -d -p 3000:3000 username/myapp:1.0
```

---

## 9. Resource Limit & Healthcheck

### Membatasi CPU dan Memori

Tanpa batasan, satu container yang bermasalah bisa menghabiskan seluruh resource host.

```bash
docker run -d --name app \
  --memory 512m --memory-swap 512m \
  --cpus 1.0 \
  myapp:1.0
```

Di Docker Compose:

```yaml
services:
  app:
    image: myapp:1.0
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

### Healthcheck — Memantau Kesehatan Container

Docker bisa memeriksa apakah aplikasi di dalam container benar-benar sehat, bukan cuma "container-nya menyala":

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
```

Atau di Compose:

```yaml
services:
  app:
    image: myapp:1.0
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 5s
      start_period: 10s
      retries: 3
```

```bash
# Status kesehatan terlihat di docker ps (healthy/unhealthy/starting)
docker ps
```

> 💡 Healthcheck hanya mengubah status container menjadi `healthy` atau `unhealthy`. Restart policy seperti `unless-stopped` bereaksi ketika proses container berhenti, bukan ketika statusnya berubah menjadi `unhealthy`. Jika kegagalan healthcheck harus memicu restart, gunakan orchestrator atau mekanisme pemantauan eksternal, atau buat aplikasi keluar dengan status non-zero ketika tidak dapat pulih.

---

## 10. Keamanan Container

- **Jangan jalankan sebagai root** — tambahkan user non-root di Dockerfile:

  ```dockerfile
  RUN addgroup -S app && adduser -S app -G app
  USER app
  ```

- **Batasi capability kernel** yang tidak dibutuhkan:

  ```bash
  docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp:1.0
  ```

- **Read-only filesystem** — cegah container menulis ke filesystem-nya sendiri kecuali folder yang memang dibutuhkan:

  ```bash
  docker run --read-only --tmpfs /app/tmp --tmpfs /tmp myapp:1.0
  ```

- **Scan image dari kerentanan** yang diketahui sebelum deploy:

  ```bash
  docker scout cves myapp:1.0
  ```

- **Jangan mount Docker socket** (`-v /var/run/docker.sock:/var/run/docker.sock`) ke container kecuali benar-benar diperlukan (misalnya tool CI/CD) — ini setara memberi akses root ke seluruh host.

---

## 11. Praktik Terbaik (Best Practices)

1. **Pilih image dasar minimal yang kompatibel** — varian `slim` sering menjadi pilihan aman. Varian Alpine lebih kecil, tetapi menggunakan `musl` dan dapat tidak kompatibel dengan dependensi yang mengharapkan `glibc`.
2. **Gunakan tag versi spesifik atau digest** — hindari `latest` di produksi. Tag, termasuk tag versi, dapat diperbarui; pin ke digest jika membutuhkan image yang benar-benar immutable.
3. **Manfaatkan layer cache** — salin file dependensi (`package.json`, `requirements.txt`) dan install lebih dulu, baru salin kode.
4. **Satu proses utama per container** — pisahkan app, database, dan cache ke container masing-masing.
5. **Jangan simpan secret di image** — jangan `COPY .env`; gunakan environment variable atau secret manager saat runtime.
6. **Gunakan `.dockerignore`** — agar build lebih cepat dan image lebih kecil.
7. **Jalankan sebagai non-root user** — tambahkan `USER node` (atau user lain) di Dockerfile untuk keamanan.
8. **Multi-stage build** — pisahkan proses build dari image akhir agar ukurannya minimal.
9. **Bersihkan resource secara berkala** — `docker system prune` untuk menghapus image dan container yang tidak terpakai.
10. **Batasi resource dan pasang healthcheck** — cegah satu container bermasalah menghabiskan seluruh resource host (lihat bagian 9).
11. **Jangan mount Docker socket sembarangan** dan hindari privilege berlebih (lihat bagian 10).

---

## 12. Ringkasan Perintah Cepat (Cheat Sheet)

```bash
docker pull <image>              # Unduh image
docker images                    # Daftar image
docker run -d -p 8080:80 nginx   # Jalankan container di background
docker ps                        # Container yang berjalan
docker ps -a                     # Semua container
docker logs -f <nama>            # Lihat log
docker exec -it <nama> sh        # Masuk ke container (lebih portabel)
docker stop <nama>               # Hentikan container
docker start <nama>              # Jalankan kembali container
docker rm -f <nama>              # Hapus container
docker rmi <image>               # Hapus image
docker build -t app:1.0 .        # Build image dari Dockerfile
docker compose up -d             # Jalankan semua service compose
docker compose down              # Hentikan semua service compose
docker system prune -a           # Bersihkan semua yang tidak terpakai
```

---

## Referensi

- Dokumentasi resmi: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- Best practices Dockerfile: https://docs.docker.com/build/building/best-practices/
- Play with Docker (latihan online gratis): https://labs.play-with-docker.com
