# Praktik Docker — dari halaman statis ke aplikasi + database

Pendamping `materi-docker-revisi.pptx`. Target: peserta memahami build, run, port, env, multi-stage, jaringan, dan persistensi. Estimasi kelas 150 menit: konsep 25, persiapan 10, lab 1–4 masing-masing 15/20/20/30, diskusi dan cleanup 30. Instalasi dan unduhan awal dilakukan sebelum kelas.

## Pengantar untuk peserta yang baru mengenal Docker (5–7 menit)

Naskah pembuka yang dapat disampaikan pengajar:

> Pernah punya aplikasi yang berjalan di laptop sendiri, tetapi error saat dicoba di laptop teman? Kadang masalahnya bukan di kodenya. Versi program untuk menjalankan kode atau library yang terpasang bisa berbeda.
>
> Docker membantu kita mengemas aplikasi beserta kebutuhan utamanya menjadi sebuah paket yang disebut **image**. Paket ini kemudian dijalankan dalam lingkungan proses yang terisolasi, yang disebut **container**. Tujuannya supaya lingkungan aplikasi lebih konsisten dan lebih mudah disiapkan di mesin lain.
>
> Bayangkan **Dockerfile** sebagai resep, **image** sebagai paket hasil resep itu, dan **container** sebagai satu tempat paket tersebut dijalankan. Kita bisa memakai satu image untuk membuat beberapa container.
>
> Hari ini kita mulai dari halaman web sederhana. Kita buat paketnya, jalankan, lalu lihat hasilnya di browser. Setelah itu baru mencoba aplikasi Node.js, React, dan aplikasi yang memakai database. Jadi tidak perlu menghafal semua perintah dulu; pahami apa yang sedang dibuat dan dijalankan.

Istilah pendukung: **runtime** adalah program yang menjalankan kode (contohnya Node.js); **library/dependensi** adalah komponen tambahan yang dibutuhkan aplikasi; **port** adalah nomor pintu layanan jaringan, seperti 8080 untuk halaman web latihan kita.

Batas analogi: Docker tidak membuat semua aplikasi otomatis berjalan di semua perangkat. Mesin tetap perlu Docker, platform yang kompatibel, serta pengaturan jaringan dan data yang benar. Data database tidak otomatis menjadi bagian dari image.

Cek pemahaman sebelum praktik: “Kalau image yang sama dijalankan dua kali, apakah kita mempunyai dua image atau dua container?” Jawaban: dua container dari satu image. Waktu pengantar ini termasuk jatah konsep 25 menit.

## 0. Persiapan

Gunakan Docker Engine + Compose plugin di Linux atau Docker Desktop yang sudah berjalan di macOS/Windows. Contoh shell memakai Bash/Zsh; di Windows gunakan WSL2 dan simpan repo di filesystem WSL. Jalankan dari root repository kecuali dinyatakan lain. Node.js lokal tidak diperlukan. Perlu internet untuk image dan npm saat build pertama.

```bash
docker version
docker compose version
docker run --rm hello-world
```

Lulus: `docker version` menampilkan Client **dan Server**, Compose tersedia, dan hello-world berhasil. Docker CLI saja tidak cukup. Instalasi resmi: [Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [Debian](https://docs.docker.com/engine/install/debian/), [Desktop](https://docs.docker.com/desktop/). Grup `docker` memberi hak setingkat root; gunakan hanya untuk akun tepercaya.

| Demo | URL host | Port container | Fokus |
|---|---|---|---|
| Statis | http://localhost:8080 | 80 | Build → image → container |
| Node | http://localhost:3000 | 3000 | Env, hostname, log |
| React | http://localhost:8081 | 80 | Multi-stage, SPA |
| Compose | http://localhost:3001 | 3000 | Database, DNS, volume |
| Bind mount tambahan | http://localhost:8082 | 80 | Edit tanpa rebuild |
| Node tambahan | http://localhost:3002 | 4000 | Host port ≠ container port |

Port dipublikasikan ke localhost. Jika memakai server SSH, buka lewat SSH tunnel, misalnya `ssh -L 8080:127.0.0.1:8080 user@server`, lalu akses localhost di laptop. Sesuaikan nomor port untuk lab lain.

## 1. Halaman statis: build, run, ubah (15 menit)

```bash
docker build -t docker-demo:latihan ./docker-demo
docker run -d --name lab-web -p 127.0.0.1:8080:80 docker-demo:latihan
curl -f http://localhost:8080
docker logs lab-web
docker exec lab-web nginx -t
```

Lulus: browser menampilkan halaman demo, curl mendapat HTML, konfigurasi Nginx valid. `EXPOSE 80` mendokumentasikan port; `-p` yang memublikasikannya ke host.

Ubah judul di `docker-demo/index.html`. Refresh belum mengubah halaman karena `COPY` berjalan saat build. Build ulang image, kemudian ganti container:

```bash
docker build -t docker-demo:latihan ./docker-demo
docker stop lab-web
docker rm lab-web
docker run -d --name lab-web -p 127.0.0.1:8080:80 docker-demo:latihan
```

Bandingkan dengan bind mount dari root repository:

```bash
docker run -d --name lab-bind -p 127.0.0.1:8082:80 \
  --mount "type=bind,source=$(pwd)/docker-demo/index.html,target=/usr/share/nginx/html/index.html,readonly" \
  nginx:alpine
```

Lulus: edit HTML langsung terlihat di port 8082 (refresh tanpa cache jika perlu). Diskusikan: mengapa `docker restart lab-web` saja tidak memakai image hasil build baru?

## 2. Node.js: satu image, dua container (20 menit)

```bash
docker build -t node-demo:latihan ./node-demo
docker run -d --name lab-node -p 127.0.0.1:3000:3000 node-demo:latihan
docker run -d --name lab-node-env -e PORT=4000 \
  -p 127.0.0.1:3002:4000 node-demo:latihan
curl -f http://localhost:3000/api/info
curl -f http://localhost:3002/api/info
curl -f http://localhost:3000/health
docker exec lab-node id
docker logs lab-node
```

Lulus: dua hostname berbeda, health mengembalikan `{"status":"ok"}`, user bukan root. Angka kiri pada `-p` milik host; angka kanan harus sesuai port aplikasi. Aplikasi listen pada `0.0.0.0` di container. `localhost` dalam container menunjuk container itu sendiri.

Tantangan: ubah mapping container kedua menjadi `3002:3000` sementara `PORT=4000`. Prediksi kegagalan, lalu perbaiki. Gunakan `docker logs` dan `docker ps -a`; jangan hanya menebak port.

## 3. React: multi-stage dan route SPA (20 menit)

```bash
docker build -t react-demo:latihan ./react-demo
docker run -d --name lab-react -p 127.0.0.1:8081:80 react-demo:latihan
curl -f http://localhost:8081/materi
docker exec lab-react sh -c 'command -v nginx; command -v node || true'
docker image inspect react-demo:latihan --format '{{.Size}}'
```

Lulus: buka `/materi` langsung di browser dan refresh; halaman tetap muncul. Image runtime memiliki Nginx, tanpa Node.js. Ukuran hasil inspect dalam byte dan bergantung image/platform; tidak ada target ukuran tetap. `nginx.conf` berisi fallback `try_files ... /index.html`.

`npm ci` membutuhkan `package-lock.json` yang cocok dengan package.json. Keduanya disertakan. Jika mengubah dependensi, perbarui lockfile dengan `npm install`, kemudian build ulang. Jangan mengganti `npm ci` dengan install tanpa memahami dampaknya.

## 4. Compose: counter yang persisten (30 menit)

Semua perintah berikut menggunakan file dari root repository:

```bash
docker compose -f compose-demo/compose.yaml config -q
docker compose -f compose-demo/compose.yaml up -d --build --wait
curl -f http://localhost:3001/health
curl -f http://localhost:3001/
docker compose -f compose-demo/compose.yaml ps
docker compose -f compose-demo/compose.yaml exec db \
  psql -U demo -d demo -tAc 'SELECT count(*) FROM kunjungan;'
```

Buka halaman beberapa kali. Catat jumlah baris melalui SQL, misalnya N. Browser dapat menghasilkan permintaan tambahan; patokan persistensi adalah nilai SQL, bukan asumsi jumlah klik.

```bash
docker compose -f compose-demo/compose.yaml down
docker compose -f compose-demo/compose.yaml up -d --wait
docker compose -f compose-demo/compose.yaml exec db \
  psql -U demo -d demo -tAc 'SELECT count(*) FROM kunjungan;'
```

Lulus: sebelum mengakses `/` lagi, jumlah baris tetap N. Endpoint `/health` tidak menambah counter. `down` menghapus container dan network proyek; named volume tetap ada.

Uji jaringan dan kegagalan sementara:

```bash
docker compose -f compose-demo/compose.yaml exec app \
  node -e "require('dns').lookup('db', console.log)"
docker compose -f compose-demo/compose.yaml stop db
curl -i http://localhost:3001/health
docker compose -f compose-demo/compose.yaml start db
```

Lulus: DNS `db` menghasilkan alamat, health saat DB mati menghasilkan HTTP 503, lalu kembali 200 setelah DB siap (ulangi curl). `depends_on: service_healthy` membantu urutan startup, bukan pemulihan otomatis sepanjang runtime. Healthcheck tidak otomatis me-restart container yang unhealthy.

Kredensial `demo` / `rahasia` **hanya untuk latihan lokal**, bukan produksi. PostgreSQL tidak memublikasikan port host. Volume bukan backup. Nilai inisialisasi PostgreSQL tidak mengubah kredensial database yang sudah terbentuk di volume lama.

## 5. Cleanup dan reset

Hapus hanya resource latihan yang dibuat di atas:

```bash
docker stop lab-web lab-bind lab-node lab-node-env lab-react
docker rm lab-web lab-bind lab-node lab-node-env lab-react
docker compose -f compose-demo/compose.yaml down
```

Jika sebagian lab belum dijalankan, hapus hanya nama yang ada. Untuk **reset data latihan secara sengaja**, jalankan perintah terpisah di bawah; data counter akan hilang:

```bash
docker compose -f compose-demo/compose.yaml down -v
```

Hindari `docker system prune -a` sebagai cleanup rutin kelas karena mencakup resource proyek lain.

## Troubleshooting

| Gejala | Periksa | Tindakan |
|---|---|---|
| Cannot connect to daemon | `docker version` | Jalankan Desktop/Engine; cek context |
| Port already allocated | `docker ps` dan port host | Hentikan container lab lama atau ubah port kiri |
| Nama container sudah ada | `docker ps -a` | Hapus container lab lama sebelum run ulang |
| `npm ci` gagal | Lockfile dan build context | Sertakan package-lock.json; build dari folder yang benar |
| Container langsung exit | `docker logs NAMA` | Perbaiki error proses utama |
| Bash tidak ditemukan | Image Alpine | Gunakan `docker exec -it NAMA sh` |
| DB connection refused | Log app/db, `DB_HOST` | Host harus `db`; tunggu health DB |
| Perubahan kode tak terlihat | COPY vs bind mount | Build ulang **dan buat ulang** container |
| React route 404 | nginx.conf | Pastikan fallback SPA tersalin ke image |
| Data seolah hilang | Proyek Compose dan volume | Gunakan file/project name yang sama; jangan `down -v` |

## Evaluasi akhir

Peserta dapat menjelaskan image vs container, membetulkan port yang salah, menunjukkan user aplikasi, membuktikan route React, dan menunjukkan jumlah baris DB tetap setelah `down`/`up`. Bukti yang dikumpulkan: hasil `/api/info`, status Compose, dan hasil SQL sebelum/sesudah. Jawaban: restart memakai container lama; perubahan image memerlukan container baru; DNS service memakai network Compose; data persist karena named volume.

Referensi: [Dockerfile](https://docs.docker.com/reference/dockerfile/), [startup Compose](https://docs.docker.com/compose/how-tos/startup-order/), [volume](https://docs.docker.com/engine/storage/volumes/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
