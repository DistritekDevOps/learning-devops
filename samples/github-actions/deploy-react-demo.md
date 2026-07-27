# Penjelasan Workflow Deployment React Demo

File yang dijelaskan:
[`deploy-react-demo.yml`](deploy-react-demo.yml).

File YAML tersebut merupakan **sampel** dan belum aktif karena disimpan di luar
folder `.github/workflows`.

Alur utamanya:

```text
Workflow dijalankan manual
          |
          v
Build image React Demo
          |
          v
Push image ke Docker Hub
          |
          v
SSH ke server
          |
          v
Jalankan container baru
          |
          v
Health check
     |           |
  berhasil     gagal
     |           |
     v           v
  selesai      rollback
```

## 1. Mengaktifkan workflow

File sampel berada di:

```text
samples/github-actions/deploy-react-demo.yml
```

GitHub tidak akan menjalankan workflow dari folder tersebut. Agar aktif, salin
menjadi:

```text
.github/workflows/deploy-react-demo.yml
```

Jangan memindahkannya sebelum variable, secret, Docker Hub, dan server deployment
selesai disiapkan.

## 2. Nama workflow

```yaml
name: Deploy React Demo
```

`name` menentukan nama workflow yang akan terlihat pada tab **Actions**.

## 3. Trigger manual

```yaml
on:
  workflow_dispatch:
```

`workflow_dispatch` membuat workflow hanya berjalan ketika pengguna menekan tombol
**Run workflow**.

Workflow tidak otomatis berjalan saat:

- melakukan push;
- membuat pull request;
- melakukan merge ke `main`.

Trigger manual cocok untuk pembelajaran dan deployment yang masih membutuhkan
kontrol operator.

## 4. Permission

```yaml
permissions:
  contents: read
```

Workflow hanya diberi izin membaca source repository. `GITHUB_TOKEN` tidak diberi
hak untuk mengubah commit, issue, release, atau konfigurasi repository.

Prinsip yang digunakan adalah **least privilege**: berikan izin minimum yang
dibutuhkan.

## 5. Concurrency

```yaml
concurrency:
  group: react-demo-production
  cancel-in-progress: false
```

`concurrency` mencegah beberapa deployment production berjalan bersamaan.

- `group` adalah nama kelompok deployment.
- `cancel-in-progress: false` berarti deployment yang sedang berjalan tidak
  dihentikan ketika ada deployment baru.

Deployment sebaiknya tidak diputus ketika sedang mengganti container pada server.

## 6. Environment variable global

```yaml
env:
  IMAGE_NAME: ${{ vars.DOCKERHUB_USERNAME }}/react-demo
  IMAGE_TAG: sha-${{ github.sha }}
  CONTAINER_NAME: react-demo
  DEPLOY_PORT: ${{ vars.DEPLOY_PORT || '8081' }}
```

Environment variable tersebut dapat digunakan oleh semua job.

### `IMAGE_NAME`

```yaml
IMAGE_NAME: ${{ vars.DOCKERHUB_USERNAME }}/react-demo
```

Membentuk nama image Docker Hub.

Jika `DOCKERHUB_USERNAME` berisi `distritek`, hasilnya:

```text
distritek/react-demo
```

### `IMAGE_TAG`

```yaml
IMAGE_TAG: sha-${{ github.sha }}
```

Memberikan tag berdasarkan commit Git yang menjalankan workflow.

Contoh:

```text
sha-a12bc34def567...
```

Tag commit lebih aman untuk deployment daripada hanya menggunakan `latest` karena
setiap image dapat dilacak ke source code tertentu.

### `CONTAINER_NAME`

```yaml
CONTAINER_NAME: react-demo
```

Nama container yang akan digunakan pada server.

### `DEPLOY_PORT`

```yaml
DEPLOY_PORT: ${{ vars.DEPLOY_PORT || '8081' }}
```

Mengambil port dari GitHub variable `DEPLOY_PORT`. Jika variable tidak tersedia,
workflow memakai port `8081`.

Ekspresi `A || B` berarti gunakan `A`; jika nilainya kosong, gunakan `B`.

## 7. GitHub Actions context

Workflow menggunakan beberapa context:

| Context | Contoh | Fungsi |
|---|---|---|
| `vars` | `${{ vars.DEPLOY_PORT }}` | Membaca variable GitHub |
| `secrets` | `${{ secrets.SSH_HOST }}` | Membaca data rahasia |
| `github` | `${{ github.sha }}` | Membaca informasi workflow dan commit |
| `env` | `${{ env.IMAGE_NAME }}` | Membaca environment variable |

Sintaks `${{ ... }}` disebut GitHub Actions Expression.

## 8. Daftar job

```yaml
jobs:
```

Workflow memiliki dua job:

1. `build-and-push`;
2. `deploy`.

Job pertama membangun image. Job kedua memasang image tersebut pada server.

## 9. Job build-and-push

```yaml
build-and-push:
  name: Build dan Push Image
  runs-on: ubuntu-latest
  timeout-minutes: 20
```

Penjelasan:

- `build-and-push` adalah ID internal job;
- `name` adalah nama yang tampil di halaman GitHub;
- `runs-on` memilih runner Ubuntu milik GitHub;
- `timeout-minutes` menghentikan job jika lebih dari 20 menit.

## 10. Checkout source

```yaml
- name: Checkout source
  uses: actions/checkout@v6
```

Runner GitHub dimulai sebagai mesin baru. Action `checkout` mengunduh source
repository agar folder `react-demo` tersedia pada runner.

Tanpa checkout, Docker tidak dapat menemukan Dockerfile dan source React.

## 11. Setup Docker Buildx

```yaml
- name: Setup Docker Buildx
  uses: docker/setup-buildx-action@v4
```

Action ini menyiapkan Docker Buildx dan BuildKit.

Buildx menyediakan fitur seperti:

- build cache;
- multi-platform build;
- metadata image;
- metode build Docker yang lebih modern.

## 12. Login ke Docker Hub

```yaml
- name: Login ke Docker Hub
  uses: docker/login-action@v4
  with:
    username: ${{ vars.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Runner login ke Docker Hub agar dapat mengirim image.

- Username disimpan sebagai variable biasa.
- Token disimpan sebagai secret.
- Gunakan Docker Hub access token, bukan password akun utama.

## 13. Build dan push image

```yaml
- name: Build dan push image
  uses: docker/build-push-action@v7
```

Action ini membaca Dockerfile, membangun aplikasi React, membuat image akhir
Nginx, lalu mengirimkan image ke Docker Hub.

### Build context

```yaml
context: ./react-demo
```

Docker hanya menggunakan folder `react-demo` sebagai build context.

Dockerfile yang digunakan:

```text
react-demo/Dockerfile
```

### Push image

```yaml
push: true
```

Image dikirim ke Docker Hub setelah proses build berhasil.

Jika `push` bernilai `false`, image hanya dibangun pada runner dan akan hilang
setelah job selesai.

### Tag image

```yaml
tags: |
  ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
  ${{ env.IMAGE_NAME }}:latest
```

Satu image diberi dua tag.

Contoh:

```text
distritek/react-demo:sha-a12bc34...
distritek/react-demo:latest
```

Fungsi tag:

- tag SHA digunakan untuk deployment dan rollback;
- `latest` menjadi penanda versi terbaru untuk manusia.

Deployment tetap menggunakan tag SHA agar image yang dipasang tidak berubah secara
tidak sengaja.

## 14. Build cache

```yaml
cache-from: type=gha,scope=react-demo
cache-to: type=gha,mode=max,scope=react-demo
```

### `cache-from`

Mengambil cache dari GitHub Actions agar layer Docker yang tidak berubah dapat
digunakan kembali.

### `cache-to`

Menyimpan cache hasil build saat ini untuk workflow berikutnya.

### `scope=react-demo`

Memisahkan cache React Demo dari cache aplikasi lain.

### `mode=max`

Menyimpan sebanyak mungkin layer intermediate sehingga build berikutnya dapat
lebih cepat.

Cache hanya optimasi. Workflow harus tetap berhasil ketika cache tidak tersedia.

## 15. Job deploy

```yaml
deploy:
  name: Deploy ke Server
  needs: build-and-push
  runs-on: ubuntu-latest
  timeout-minutes: 15
```

### `needs`

```yaml
needs: build-and-push
```

Job deploy menunggu job build selesai. Jika build atau push gagal, deployment tidak
dijalankan.

### Runner dan timeout

Deployment dijalankan pada runner Ubuntu dengan batas waktu 15 menit.

## 16. GitHub Environment

```yaml
environment:
  name: production
  url: ${{ vars.DEPLOY_URL }}
```

Job dicatat sebagai deployment ke environment `production`.

GitHub Environment dapat digunakan untuk:

- menyimpan secret khusus production;
- membatasi branch yang boleh melakukan deployment;
- menambahkan approval;
- menampilkan URL aplikasi.

`DEPLOY_URL` hanya berfungsi sebagai tautan informasi. Nilai tersebut tidak
menentukan alamat SSH atau port container.

## 17. Deployment melalui SSH

```yaml
- name: Deploy melalui SSH
  uses: appleboy/ssh-action@v1
```

Action tersebut membuka koneksi SSH dari runner GitHub ke server deployment, lalu
menjalankan shell script pada server.

Konfigurasi SSH:

```yaml
host: ${{ secrets.SSH_HOST }}
username: ${{ secrets.SSH_USERNAME }}
key: ${{ secrets.SSH_PRIVATE_KEY }}
fingerprint: ${{ secrets.SSH_FINGERPRINT }}
```

| Input | Fungsi |
|---|---|
| `host` | IP atau domain server |
| `username` | User Linux untuk deployment |
| `key` | Private key untuk autentikasi SSH |
| `fingerprint` | Memastikan identitas server SSH |

Fingerprint membantu mencegah workflow terhubung ke server palsu.

## 18. Mengirim variable ke server

```yaml
env:
  IMAGE_NAME: ${{ env.IMAGE_NAME }}
  IMAGE_TAG: ${{ env.IMAGE_TAG }}
  CONTAINER_NAME: ${{ env.CONTAINER_NAME }}
  DEPLOY_PORT: ${{ env.DEPLOY_PORT }}
  DOCKERHUB_USERNAME: ${{ vars.DOCKERHUB_USERNAME }}
  DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
```

Bagian tersebut menyiapkan nilai yang dibutuhkan action SSH.

```yaml
envs: IMAGE_NAME,IMAGE_TAG,CONTAINER_NAME,DEPLOY_PORT,DOCKERHUB_USERNAME,DOCKERHUB_TOKEN
```

`envs` menentukan variable yang diteruskan ke shell pada server remote.

Tanpa `envs`, variable pada runner belum tentu tersedia di dalam script server.

## 19. Shell safety

```sh
set -eu
```

- `-e` menghentikan script ketika suatu perintah gagal.
- `-u` menghentikan script ketika menggunakan variable yang belum didefinisikan.

Tujuannya agar script tidak diam-diam melanjutkan deployment setelah terjadi
kesalahan.

## 20. Login Docker Hub pada server

```sh
printf '%s' "$DOCKERHUB_TOKEN" |
  docker login -u "$DOCKERHUB_USERNAME" --password-stdin
```

Server login ke Docker Hub agar dapat menarik private image.

`--password-stdin` mengirim token melalui standard input sehingga token tidak
ditulis langsung sebagai argument command.

## 21. Pull image baru

```sh
docker pull "$IMAGE_NAME:$IMAGE_TAG"
```

Server mengunduh image berdasarkan tag commit SHA.

Contoh:

```text
docker pull distritek/react-demo:sha-a12bc34...
```

Workflow tidak menarik `latest` karena isi tag tersebut dapat berubah.

## 22. Menyimpan image lama

```sh
old_image="$(
  docker inspect --format='{{.Image}}' "$CONTAINER_NAME" 2>/dev/null ||
    true
)"
```

Perintah ini mencari ID image yang sedang digunakan container lama.

Contoh hasil:

```text
sha256:4f8c...
```

ID tersebut disimpan pada variable `old_image` untuk rollback.

Penjelasan tambahan:

- `2>/dev/null` menyembunyikan error jika container belum ada;
- `|| true` menjaga script tetap berjalan pada deployment pertama;
- jika container belum ada, `old_image` akan kosong.

## 23. Menghapus container lama

```sh
docker rm --force "$CONTAINER_NAME" 2>/dev/null || true
```

Perintah tersebut:

1. menghentikan container lama;
2. menghapus container lama;
3. tetap melanjutkan jika container belum tersedia.

Image lama belum dihapus karena mungkin dibutuhkan untuk rollback.

Metode ini menyebabkan downtime singkat karena container lama dihentikan sebelum
container baru dinyatakan sehat.

## 24. Menjalankan container baru

```sh
docker run --detach \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --publish "$DEPLOY_PORT:80" \
  "$IMAGE_NAME:$IMAGE_TAG"
```

Penjelasan:

| Opsi | Fungsi |
|---|---|
| `--detach` | Menjalankan container di background |
| `--name` | Memberikan nama `react-demo` |
| `--restart unless-stopped` | Menyalakan kembali container setelah crash atau reboot |
| `--publish` | Menghubungkan port server ke port container |

Jika `DEPLOY_PORT=8081`, pemetaan port menjadi:

```text
server:8081 -> container:80
```

Port `80` adalah port Nginx di dalam image React Demo.

## 25. Persiapan health check

```sh
healthy=false
attempt=1
```

- `healthy` menyimpan hasil pemeriksaan aplikasi.
- `attempt` menghitung jumlah percobaan.

## 26. Loop health check

```sh
while [ "$attempt" -le 12 ]; do
```

Pemeriksaan dilakukan maksimal 12 kali.

```sh
curl --fail --silent \
  "http://127.0.0.1:$DEPLOY_PORT/" >/dev/null
```

`curl` dijalankan langsung pada server:

- `--fail` menghasilkan exit code gagal untuk respons HTTP 4xx/5xx;
- `--silent` menyembunyikan progress output;
- `127.0.0.1` memeriksa aplikasi melalui jaringan lokal server;
- output halaman dibuang ke `/dev/null`.

Jika berhasil:

```sh
healthy=true
break
```

Jika gagal:

```sh
sleep 5
attempt=$((attempt + 1))
```

Workflow menunggu lima detik sebelum mencoba kembali. Total waktu tunggu maksimal
sekitar 60 detik.

## 27. Menangani health check gagal

```sh
if [ "$healthy" != "true" ]; then
```

Blok tersebut dijalankan jika container baru tidak dapat memberikan respons HTTP
yang berhasil.

### Menampilkan log

```sh
docker logs "$CONTAINER_NAME" || true
```

Menampilkan log container untuk membantu diagnosis.

### Menghapus container yang gagal

```sh
docker rm --force "$CONTAINER_NAME" 2>/dev/null || true
```

Container versi baru dihentikan dan dihapus.

### Memeriksa image lama

```sh
if [ -n "$old_image" ]; then
```

`-n` memeriksa bahwa variable `old_image` tidak kosong.

### Menjalankan rollback

```sh
docker run --detach \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --publish "$DEPLOY_PORT:80" \
  "$old_image"
```

Image yang dipakai sebelum deployment dijalankan kembali dengan nama dan port yang
sama.

### Menandai workflow gagal

```sh
exit 1
```

Workflow tetap diberi status gagal meskipun rollback berhasil. Operator harus tahu
bahwa versi baru bermasalah.

## 28. Membersihkan dangling image

```sh
docker image prune --force
```

Menghapus dangling image yang:

- tidak memiliki tag;
- tidak digunakan container.

Perintah ini bukan `docker system prune` dan tidak menghapus seluruh resource
Docker.

## 29. Pesan deployment berhasil

```sh
echo "Deploy $IMAGE_NAME:$IMAGE_TAG berhasil."
```

Menulis image dan tag yang berhasil dipasang ke log workflow.

## 30. Deployment summary

```yaml
- name: Tulis deployment summary
  run: |
    {
      echo "## React Demo berhasil di-deploy"
      echo "- Commit: \`${GITHUB_SHA}\`"
      echo "- Image: \`${IMAGE_NAME}:${IMAGE_TAG}\`"
      echo "- Port: \`${DEPLOY_PORT}\`"
    } >> "$GITHUB_STEP_SUMMARY"
```

`$GITHUB_STEP_SUMMARY` adalah file khusus yang akan ditampilkan sebagai ringkasan
Markdown pada halaman workflow.

Informasi yang ditulis:

- commit yang di-deploy;
- nama dan tag image;
- port server.

Jangan menulis secret ke `$GITHUB_STEP_SUMMARY`.

## 31. Variable yang perlu dibuat

| Nama | Tempat | Wajib | Fungsi |
|---|---|---|---|
| `DOCKERHUB_USERNAME` | Repository Variable | Ya | Namespace image Docker Hub |
| `DEPLOY_PORT` | Environment/Repository Variable | Tidak | Port aplikasi, default `8081` |
| `DEPLOY_URL` | Environment Variable | Disarankan | URL yang tampil pada deployment |

## 32. Secret yang perlu dibuat

| Nama | Tempat | Fungsi |
|---|---|---|
| `DOCKERHUB_TOKEN` | Repository/Environment Secret | Push dan pull image |
| `SSH_HOST` | Environment Secret | IP atau domain server |
| `SSH_USERNAME` | Environment Secret | User deployment |
| `SSH_PRIVATE_KEY` | Environment Secret | Autentikasi SSH |
| `SSH_FINGERPRINT` | Environment Secret | Verifikasi identitas server |

Secret deployment sebaiknya disimpan pada GitHub Environment `production`.

## 33. Kelebihan sampel

- Deployment dijalankan manual.
- Job build dan deployment dipisahkan.
- Deployment hanya berjalan setelah build berhasil.
- Image diberi tag commit SHA.
- Build memakai cache.
- SSH memverifikasi fingerprint server.
- Deployment memiliki health check.
- Kegagalan dapat memicu rollback.
- Deploy bersamaan dicegah dengan concurrency.

## 34. Keterbatasan sampel

### Masih memiliki downtime

Container lama dihapus sebelum container baru dinyatakan sehat. Untuk zero-downtime,
gunakan:

- blue/green deployment;
- reverse proxy;
- Docker Swarm;
- Kubernetes;
- platform deployment yang mendukung rolling update.

### Health check masih sederhana

Workflow hanya memeriksa apakah `/` menghasilkan respons HTTP berhasil. Pemeriksaan
belum memastikan JavaScript berhasil berjalan di browser.

Untuk pengujian lebih lengkap, gunakan browser automation seperti Playwright.

### Action belum dipin ke commit SHA

Tag seperti:

```yaml
uses: docker/build-push-action@v7
```

mudah dibaca untuk pembelajaran. Untuk production, pin third-party action ke full
commit SHA.

### Rollback hanya mengembalikan image

Sampel React tidak memiliki database. Pada aplikasi yang menggunakan database,
rollback image belum tentu dapat membatalkan perubahan skema database.

## 35. Checklist sebelum mengaktifkan

- [ ] Repository `react-demo` tersedia di Docker Hub.
- [ ] Docker Hub access token sudah dibuat.
- [ ] Seluruh variable sudah dikonfigurasi.
- [ ] Seluruh secret sudah dikonfigurasi.
- [ ] GitHub Environment `production` sudah dibuat.
- [ ] Docker tersedia pada server.
- [ ] `curl` tersedia pada server.
- [ ] User SSH dapat menjalankan Docker.
- [ ] Port deployment tidak dipakai aplikasi lain.
- [ ] Firewall membuka port aplikasi atau reverse proxy sudah dikonfigurasi.
- [ ] SSH fingerprint telah diverifikasi.
- [ ] Workflow sudah ditinjau sebelum dipindahkan ke `.github/workflows`.
