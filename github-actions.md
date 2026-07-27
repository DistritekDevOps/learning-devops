# GitHub Actions: dari Pemula sampai Mahir

Materi ini berlaku secara umum dan menggunakan empat aplikasi sebagai studi kasus
bertahap:

| Tahap | Sampel | Fokus GitHub Actions |
|---|---|---|
| 1 | [`docker-demo`](docker-demo/) | Build image dan smoke test HTML statis |
| 2 | [`node-demo`](node-demo/) | Syntax check dan test endpoint API |
| 3 | [`react-demo`](react-demo/) | Dependency cache, build frontend, multi-stage image |
| 4 | [`compose-demo`](compose-demo/) | Integration test multi-container dan database |

`docker-demo` dipakai lagi pada praktik deployment karena paling sederhana untuk
menjelaskan alur CD tanpa membebani peserta dengan detail aplikasi.

Target akhirnya adalah pipeline:

```text
Git push / Run workflow
          |
          v
 Validasi empat aplikasi
          |
          v
 Build + test container
          |
          v
 Pilih docker-demo untuk release
          |
          v
 Push image ke Docker Hub
          |
          v
 Deploy ke server via SSH
          |
          v
 Health check --- gagal ---> Rollback
```

Materi ini belum memasang workflow aktif ke `.github/workflows`. Potongan YAML
digunakan sebagai bahan belajar dan akan dirangkai peserta secara bertahap saat
praktik.

---

## 1. Persiapan

Peserta membutuhkan:

- akun GitHub;
- Git;
- Docker atau Podman;
- repository ini;
- akun Docker Hub untuk bagian deployment;
- server Linux dengan Docker dan akses SSH untuk bagian deployment.

Uji sampel pertama secara lokal:

```bash
cd docker-demo
docker build -t docker-demo:local .
docker run -d --name docker-demo -p 8080:80 docker-demo:local
docker ps
curl http://localhost:8080
docker rm -f docker-demo
```

File yang dipakai:

```text
docker-demo/
├── .dockerignore
├── Dockerfile
├── index.html
└── README.md
```

Sampel berikutnya menambah kompleksitas:

```text
node-demo       : aplikasi dinamis dan endpoint JSON
react-demo      : npm ci, Vite, React, dan multi-stage Docker build
compose-demo    : Node.js, PostgreSQL, network, volume, dan health check
```

Rancangan workflow global pada tahap akhir akan memiliki empat job yang berjalan
paralel:

```text
                 +--> 1 - HTML Statis
pull request ----+--> 2 - Node.js API
                 +--> 3 - React Multi-stage
                 +--> 4 - Node.js dan PostgreSQL
```

---

# Bagian A — Pemula

## 2. Apa itu GitHub Actions?

GitHub Actions adalah layanan otomasi yang terhubung dengan repository GitHub.
Contoh penggunaannya:

- memeriksa kode setiap ada pull request;
- membangun image Docker;
- menjalankan test;
- menerbitkan image;
- melakukan deployment.

Istilah penting:

| Istilah | Arti |
|---|---|
| Workflow | Satu berkas YAML di `.github/workflows/` |
| Event | Pemicu workflow, misalnya `push` |
| Job | Kelompok pekerjaan yang berjalan pada runner |
| Step | Satu perintah atau action di dalam job |
| Runner | Mesin yang mengeksekusi job |
| Action | Komponen otomasi reusable |

## 3. Workflow pertama

Buat `.github/workflows/hello.yml`:

```yaml
name: Hello

on:
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Halo GitHub Actions"
```

Penjelasan:

- `name` adalah nama yang tampil di tab Actions;
- `workflow_dispatch` menyediakan tombol **Run workflow**;
- `jobs` berisi pekerjaan;
- `runs-on` memilih runner;
- `run` menjalankan perintah shell.

## 4. Checkout source

Runner dimulai sebagai mesin baru. Source repository belum ada sampai workflow
melakukan checkout:

```yaml
steps:
  - name: Checkout source
    uses: actions/checkout@v6

  - name: Lihat file
    run: ls -la
```

`uses` memakai action, sedangkan `run` menjalankan perintah.

## 5. Build Docker di CI

Potongan inti workflow `docker-demo`:

```yaml
- uses: actions/checkout@v6

- name: Build image
  run: docker build --tag docker-demo:ci ./docker-demo
```

GitHub-hosted runner Ubuntu sudah menyediakan Docker.

## 6. Menjalankan container di CI

Build yang sukses belum membuktikan web dapat diakses:

```yaml
- name: Run container
  run: docker run -d --name docker-demo-ci -p 8080:80 docker-demo:ci

- name: Verify page
  run: |
    curl --fail http://127.0.0.1:8080 |
      grep --fixed-strings "Halo dari dalam Container!"
```

Ini disebut **smoke test**: pemeriksaan kecil untuk memastikan fungsi utama hidup.

## 7. Trigger

Workflow CI global memakai:

```yaml
on:
  pull_request:
    paths:
      - "docker-demo/**"
      - "node-demo/**"
      - "react-demo/**"
      - "compose-demo/**"
  push:
    branches: [main]
    paths:
      - "docker-demo/**"
      - "node-demo/**"
      - "react-demo/**"
      - "compose-demo/**"
  workflow_dispatch:
```

Artinya:

- periksa perubahan `docker-demo` pada pull request;
- periksa perubahan pada salah satu dari empat sampel;
- periksa push ke `main`;
- izinkan eksekusi manual.

## 8. Praktik pemula

1. Buka tab **Actions**.
2. Pilih **CI - Semua Demo**.
3. Klik **Run workflow**.
4. Buka job **Build dan Smoke Test**.
5. Baca output setiap step.
6. Ubah teks pada `index.html`.
7. Buat pull request dan amati CI.

Eksperimen kegagalan:

1. Ubah `COPY index.html` menjadi nama file yang tidak ada.
2. Push ke branch latihan.
3. Temukan pesan error pada step build.
4. Perbaiki Dockerfile dan push ulang.

Kriteria lulus:

- dapat menjelaskan event, job, step, dan runner;
- dapat menemukan step yang gagal;
- dapat menjalankan workflow manual.

---

# Bagian B — Menengah

## 9. Studi kasus Node.js

`node-demo` menambahkan aplikasi dinamis dan endpoint JSON. Quality gate-nya:

```yaml
- name: Check JavaScript syntax
  run: node --check node-demo/server.js

- name: Test API
  run: |
    curl --fail --silent http://127.0.0.1:3000/api/info |
      grep --fixed-strings '"nodeVersion"'
```

Pelajaran:

- build image saja tidak cukup;
- API perlu diperiksa dari sudut pandang client;
- log container harus ditampilkan ketika test gagal;
- container aplikasi berjalan sebagai user non-root.

## 10. Studi kasus React

`react-demo` menambahkan dependency dan proses build:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: react-demo/package-lock.json

- run: npm ci
- run: npm run build
```

Setelah build aplikasi lulus, workflow juga membangun image multi-stage dan menguji
route `/materi`. Ini membuktikan konfigurasi fallback React Router pada Nginx
berfungsi.

`npm ci` dipilih karena menggunakan lockfile secara ketat dan cocok untuk CI.

## 11. Studi kasus Docker Compose

`compose-demo` adalah integration test dua service:

```yaml
- run: docker compose config --quiet
- run: docker compose up --detach --build --wait
- run: curl --fail http://127.0.0.1:3001/
- if: always()
  run: docker compose down --volumes --remove-orphans
```

Yang diuji:

- konfigurasi Compose valid;
- image aplikasi dapat dibangun;
- PostgreSQL healthy;
- aplikasi dapat terhubung ke database;
- request HTTP dapat menulis dan membaca data.

`down --volumes` aman pada runner CI sementara, tetapi jangan menjalankannya pada
volume production karena akan menghapus data.

## 12. Permissions

Workflow CI hanya perlu membaca source:

```yaml
permissions:
  contents: read
```

Selalu mulai dari hak minimum. Tambahkan permission hanya jika suatu job memang
membutuhkannya.

## 13. Timeout

Jangan biarkan job macet tanpa batas:

```yaml
jobs:
  test-image:
    timeout-minutes: 10
```

## 14. Concurrency

Untuk CI, run lama pada branch yang sama boleh dibatalkan:

```yaml
concurrency:
  group: demo-ci-${{ github.ref }}
  cancel-in-progress: true
```

Jika peserta push tiga kali dengan cepat, hanya commit terbaru yang relevan.

Untuk production, gunakan:

```yaml
concurrency:
  group: docker-demo-production
  cancel-in-progress: false
```

Deploy yang sedang mengubah server tidak boleh diputus di tengah jalan.

## 15. Cleanup yang selalu berjalan

Container test harus dihapus meskipun test gagal:

```yaml
- name: Cleanup
  if: always()
  run: docker rm -f docker-demo-ci 2>/dev/null || true
```

`always()` membuat step tetap berjalan setelah kegagalan.

## 16. Health check

Pada latihan health check, peserta akan menambahkan:

```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
```

Perbedaan:

- **running**: proses container masih berjalan;
- **healthy**: pemeriksaan aplikasi berhasil;
- **unhealthy**: proses mungkin hidup, tetapi layanan tidak siap.

Cek lokal:

```bash
docker inspect \
  --format '{{.State.Health.Status}}' \
  docker-demo
```

## 17. Variables dan secrets

Gunakan variable untuk konfigurasi yang tidak rahasia:

| Nama | Contoh | Tempat |
|---|---|---|
| `DOCKERHUB_USERNAME` | `namauser` | Repository variable |
| `DEPLOY_PORT` | `8080` | Environment/repository variable |
| `DEPLOY_URL` | `https://demo.example.com` | Environment variable |

Gunakan secret untuk credential:

| Nama | Isi |
|---|---|
| `DOCKERHUB_TOKEN` | Personal access token Docker Hub |
| `SSH_HOST` | IP/domain server |
| `SSH_USERNAME` | User SSH |
| `SSH_PRIVATE_KEY` | Private key untuk deployment |
| `SSH_FINGERPRINT` | SHA256 fingerprint host SSH |

Docker merekomendasikan access token, bukan password akun utama.

Jangan pernah:

```yaml
- run: echo "${{ secrets.DOCKERHUB_TOKEN }}"
```

## 18. Menyiapkan Docker Hub

1. Buat repository `docker-demo` di Docker Hub.
2. Buat personal access token.
3. Di GitHub buka **Settings → Secrets and variables → Actions**.
4. Tambah variable `DOCKERHUB_USERNAME`.
5. Tambah secret `DOCKERHUB_TOKEN`.

Login dan push dilakukan oleh:

```yaml
- uses: docker/login-action@v4
  with:
    username: ${{ vars.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- uses: docker/build-push-action@v7
  with:
    context: ./docker-demo
    push: true
    tags: namauser/docker-demo:latest
```

## 19. Cache build

BuildKit cache mempercepat build berikutnya:

```yaml
cache-from: type=gha,scope=docker-demo
cache-to: type=gha,mode=max,scope=docker-demo
```

Cache adalah optimasi. Pipeline harus tetap benar saat cache kosong.

## 20. Praktik menengah

1. Jalankan keempat job CI.
2. Bandingkan quality gate setiap sampel.
3. Buat syntax error pada `node-demo/server.js`.
4. Rusak route fallback pada `react-demo/nginx.conf`.
5. Ubah password database hanya pada salah satu service Compose.
6. Amati jenis kegagalan dan log masing-masing.
7. Pulihkan perubahan sampai seluruh job hijau.

Kriteria lulus:

- CI memeriksa image, bukan hanya berhasil membangunnya;
- cleanup selalu berjalan;
- variable biasa dan secret disimpan di tempat yang benar.

---

# Bagian C — Deployment

## 21. Menyiapkan server

Di server:

```bash
docker --version
docker ps
```

User SSH harus mendapat izin menjalankan Docker. Hindari memakai akun `root` jika
tidak diperlukan.

Buat key khusus deployment pada komputer operator:

```bash
ssh-keygen -t ed25519 -C "github-actions-docker-demo"
```

Pasang public key pada `~/.ssh/authorized_keys` user deployment. Simpan private key
sebagai `SSH_PRIVATE_KEY`.

Ambil fingerprint host dari sumber tepercaya atau console server, lalu simpan
sebagai `SSH_FINGERPRINT`. Verifikasi fingerprint mencegah koneksi ke host palsu.

## 22. GitHub Environment

Buat environment `production`:

1. **Settings → Environments → New environment**.
2. Nama: `production`.
3. Tambahkan secret SSH ke environment.
4. Tambahkan variable `DEPLOY_PORT` dan `DEPLOY_URL`.
5. Batasi deployment dari branch `main`.
6. Jika tersedia pada paket GitHub, tambahkan required reviewer.

Job deployment mereferensikannya:

```yaml
environment:
  name: production
  url: ${{ vars.DEPLOY_URL }}
```

## 23. Tag immutable

Jangan deploy hanya dengan `latest`:

```yaml
IMAGE_TAG: sha-${{ github.sha }}
```

Image yang dipublikasikan:

```text
namauser/docker-demo:sha-<commit>
namauser/docker-demo:latest
```

Deployment menggunakan tag SHA. Dengan begitu operator tahu persis commit yang
sedang berjalan dan dapat rollback.

## 24. Menjalankan demo deployment

Checklist sebelum demo:

- workflow sudah berada pada branch `main`;
- repository Docker Hub sudah ada;
- variable dan secret telah diisi;
- environment `production` telah dibuat;
- server dapat diakses GitHub runner;
- port deployment tidak dipakai service lain.

Langkah demo:

1. Buka **Actions**.
2. Pilih **Docker Demo - Deploy**.
3. Klik **Run workflow**.
4. Tunjukkan job `Validasi Image`.
5. Tunjukkan job `Build dan Push`.
6. Jika approval diaktifkan, setujui deployment.
7. Tunjukkan job `Deploy ke Server`.
8. Buka `DEPLOY_URL` atau `http://SERVER:8080`.
9. Buka job summary dan tunjukkan commit, tag, serta digest.

Verifikasi dari server:

```bash
docker ps
docker inspect --format '{{.Config.Image}}' docker-demo
docker inspect --format '{{.State.Health.Status}}' docker-demo
docker logs docker-demo
curl http://127.0.0.1:8080
```

## 25. Alur rollback

Rancangan workflow deployment:

1. menyimpan ID image container lama;
2. menarik image baru bertag SHA;
3. mengganti container;
4. menunggu status `healthy`;
5. jika gagal, menghapus container baru;
6. menjalankan kembali image lama.

Simulasi aman:

1. Buat branch latihan.
2. Ubah health check ke URL yang tidak ada.
3. Jalankan pada server/lab terpisah.
4. Amati log health check.
5. Pastikan image lama kembali hidup.

Demo rollback menimbulkan downtime singkat karena hanya ada satu container. Untuk
tanpa downtime, gunakan pola blue/green atau orchestrator.

---

# Bagian D — Mahir

## 26. Docker metadata, SBOM, dan provenance

Pada latihan tingkat mahir, workflow akan mengaktifkan:

```yaml
sbom: true
provenance: mode=max
```

- **SBOM** mencatat komponen software di dalam image.
- **Provenance** mencatat informasi bagaimana dan dari source mana image dibuat.
- **Digest** mengidentifikasi isi image secara immutable.

Jangan pernah mengirim credential melalui Docker `ARG`. Build argument dapat masuk
metadata/provenance.

## 27. Pin action ke commit SHA

Tag mayor mudah dibaca untuk kelas:

```yaml
uses: docker/build-push-action@v7
```

Untuk production, pin full commit SHA:

```yaml
uses: docker/build-push-action@<full-commit-sha> # v7.x.x
```

Ini mengurangi risiko tag action dipindahkan. Gunakan Dependabot untuk membantu
memperbarui SHA:

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

## 28. Branch protection

Atur `main` agar:

- perubahan masuk melalui pull request;
- empat job pada workflow **CI - Semua Demo** wajib lulus;
- review wajib sebelum merge;
- force push dilarang.

Dengan aturan tersebut, alurnya menjadi:

```text
branch -> pull request -> CI hijau -> review -> merge -> deploy manual
```

## 29. Scan vulnerability

Tambahkan scan image sebelum job deploy. Kebijakan awal yang realistis:

- tampilkan semua temuan;
- gagalkan deployment untuk severity `CRITICAL`;
- buat proses pengecualian yang memiliki alasan dan masa berlaku.

Scanner yang umum adalah Docker Scout atau Trivy. Pin action scanner ke commit SHA
dan beri permission minimum.

## 30. Blue/green deployment

Deployment saat ini mengganti satu container sehingga ada downtime singkat.

Blue/green:

```text
Nginx -> blue :8081 (versi aktif)
         green:8082 (versi baru)
```

Proses:

1. jalankan versi baru pada port tidak aktif;
2. health check;
3. alihkan reverse proxy;
4. reload Nginx;
5. pertahankan versi lama untuk rollback cepat.

## 31. OIDC

OIDC memungkinkan workflow meminta credential cloud berumur pendek tanpa menyimpan
access key jangka panjang. Gunakan saat registry atau platform deployment mendukung
federated identity.

Docker Hub + server SSH pada demo ini masih menggunakan token dan key. Untuk sistem
cloud, OIDC lebih baik daripada access key statis.

## 32. Self-hosted runner

Self-hosted runner bukan solusi otomatis yang lebih aman:

- job berjalan pada mesin milik sendiri;
- state dapat tertinggal antar-job;
- kode pull request berbahaya dapat menyerang runner;
- secret produksi dan jaringan internal menjadi target.

Jangan jalankan pull request publik yang tidak tepercaya pada runner produksi.

## 33. Observability deployment

Minimal catat:

- commit SHA;
- image tag;
- image digest;
- actor;
- waktu deployment;
- environment;
- hasil health check;
- apakah rollback terjadi.

Workflow lanjutan sebaiknya menulis tag dan digest ke
`$GITHUB_STEP_SUMMARY`.

## 34. Tantangan mahir

1. Pin seluruh action ke full commit SHA.
2. Tambahkan Dependabot untuk GitHub Actions.
3. Tambahkan vulnerability scan.
4. Ubah deploy menjadi blue/green.
5. Tambahkan notifikasi setelah sukses/gagal.
6. Buat reusable workflow untuk build dan smoke test.
7. Batasi user deployment hanya pada perintah yang diperlukan.

Kriteria lulus:

- image production dapat dilacak ke commit dan digest;
- deploy paralel tidak dapat bertabrakan;
- kegagalan health check memicu rollback;
- credential memiliki scope minimum;
- pull request tidak mendapat secret produksi.

---

## 35. Troubleshooting

### Workflow tidak muncul

- Pastikan YAML ada di `.github/workflows/`.
- Pastikan workflow sudah berada di default branch untuk tombol manual.
- Periksa indentasi YAML.

### Login Docker Hub gagal

- Pastikan memakai access token, bukan password.
- Pastikan `DOCKERHUB_USERNAME` adalah variable.
- Pastikan `DOCKERHUB_TOKEN` adalah secret.
- Pastikan repository Docker Hub sudah dibuat dan user punya akses push.

### SSH gagal

- Periksa host, username, private key, dan firewall.
- Pastikan port SSH dapat diakses dari GitHub-hosted runner.
- Cocokkan `SSH_FINGERPRINT`.
- Uji key yang sama dari mesin operator.

### Container unhealthy

```bash
docker ps -a
docker inspect docker-demo
docker logs docker-demo
curl -v http://127.0.0.1:8080
```

### Port sudah dipakai

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
sudo ss -lntp
```

Ubah variable `DEPLOY_PORT` atau hentikan service yang memang boleh dihentikan.

---

## 36. Referensi

- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [Concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency)
- [Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker image publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Docker SBOM and provenance](https://docs.docker.com/build/ci/github-actions/attestations/)
- [Appleboy SSH Action](https://github.com/appleboy/ssh-action)
