# Praktik GitHub Actions untuk Pemula

Pendamping **materi-github-actions.pptx**. Durasi sekitar 120 menit: pengantar/persiapan 25, Hello 15, CI Node 25, eksperimen gagal/pulih 15, studi Docker/React/Compose 15, pengantar deployment 15, evaluasi 10.

## Naskah pembuka pengajar

> Setiap kali kode berubah, kita biasanya perlu memeriksa apakah aplikasi masih berjalan. Kalau dikerjakan manual terus, ada langkah yang bisa terlupa. GitHub Actions membantu menjalankan daftar pekerjaan itu secara otomatis.
>
> Kita menuliskan langkahnya dalam file bernama workflow. Saat ada pemicu, misalnya pull request atau tombol Run workflow ditekan, sebuah mesin yang disebut runner mengerjakan langkah tersebut. Hasil dan log-nya dapat dilihat di GitHub.
>
> Hari ini kita mulai dari mencetak pesan, lalu memeriksa aplikasi sederhana. Tujuan awalnya bukan menghafal YAML, tetapi memahami kapan pekerjaan berjalan, apa yang diperiksa, dan bagaimana mencari penyebab kegagalan.

Git mencatat riwayat kode; GitHub menjadi tempat kolaborasi; Actions menjalankan otomasi. Docker dapat dipakai di Actions untuk membangun dan menguji container, tetapi tidak diperlukan untuk dua lab pertama.

## 0. Persiapan repository latihan

Dibutuhkan akun GitHub dengan akses tulis pada repo latihan, Actions yang diizinkan oleh kebijakan akun/organisasi, browser, serta pengetahuan dasar file dan commit. Sesuaikan pemakaian Actions dengan kuota akun. Node.js lokal hanya diperlukan jika ingin mencoba tes di laptop.

Buat **repository baru khusus latihan**, dengan default branch `main`. Salin hanya file berikut dari repository materi dengan struktur yang sama:

```text
node-demo/
└── server.js
samples/github-actions/
└── smoke-node.mjs
.github/workflows/
├── hello-actions.yml       # dari samples/github-actions/hello-actions.yml
└── ci-node-pemula.yml      # dari samples/github-actions/ci-node-pemula.yml
```

Bisa memakai Git atau menu Add file di GitHub. Untuk pengajaran bertahap, pasang `hello-actions.yml` pada lab 1; pasang tiga file sisanya pada lab 2. Simpan source `node-demo/server.js` versi materi ini karena memiliki endpoint `/health`.

**Konteks repository sumber:** `.github/workflows/deploy-react-demo.yml` sudah ada dan memakai trigger push ke `main` serta manual. Jangan ikut menyalin file deployment tersebut ke repo pemula. Sampel baru tetap berada di `samples/` pada repository materi sehingga belum aktif.

## 1. Hello Actions — 15 menit

1. Salin [hello-actions.yml](samples/github-actions/hello-actions.yml) ke `.github/workflows/hello-actions.yml` di repo latihan.
2. Commit ke default branch.
3. Buka **Actions → Lab 1 - Hello Actions → Run workflow**.
4. Pilih branch `main`, jalankan, lalu buka run dan job `hello`.
5. Buka step **Sapa peserta**, kemudian **Lihat isi repository**.

Lulus bila log menampilkan `Halo dari GitHub Actions`, daftar file terlihat, dan job sukses.

Kenali bagian YAML:

| Bagian | Fungsi |
|---|---|
| `name` | Nama workflow di antarmuka GitHub |
| `on` | Event/pemicu |
| `workflow_dispatch` | Eksekusi manual |
| `jobs.hello` | Job dengan ID hello |
| `runs-on` | Jenis runner |
| `steps` | Daftar langkah |
| `uses` | Menggunakan action siap pakai |
| `run` | Menjalankan perintah shell |

Tombol manual memerlukan `workflow_dispatch`, file pada default branch, dan akses tulis. Workflow berisi checkout agar file repository tersedia pada workspace runner. Contoh memakai `actions/checkout@v6`, sesuai tag yang diverifikasi pada dokumentasi resmi; ini bukan klaim versi paling baru.

## 2. CI aplikasi Node.js — 25 menit

1. Salin [ci-node-pemula.yml](samples/github-actions/ci-node-pemula.yml), [smoke-node.mjs](samples/github-actions/smoke-node.mjs), dan [server.js](node-demo/server.js) sesuai struktur persiapan.
2. Commit ke `main`; trigger push menjalankan CI. Bisa juga menjalankannya lewat **Actions → Lab 2 - CI Node Pemula → Run workflow**.
3. Buka job **Syntax dan HTTP**.
4. Periksa step **Periksa sintaks** dan **Uji HTTP dan isi respons**.
5. Buat branch `latihan-ci`, ubah teks halaman, lalu buka pull request ke `main`. Amati CI pada PR.

Yang diperiksa:

- JavaScript valid secara sintaks.
- `/health` menghasilkan HTTP 200 dan JSON dengan `status: "ok"`.
- `/api/info` menghasilkan HTTP 200 serta field versi Node, hostname, dan uptime.
- Route tidak dikenal menghasilkan HTTP 404.

Lulus bila log memuat:

```text
PASS: health 200, API valid, route tidak dikenal 404
```

Script memakai modul bawaan Node.js dan `fetch`, tanpa dependency tambahan. Server dijalankan pada port bebas; script menunggu readiness, melakukan assertion, dan menghentikan proses server dalam `finally`. Jika ingin mencoba di laptop, dari root repo jalankan:

```bash
node --check node-demo/server.js
node samples/github-actions/smoke-node.mjs
```

Ini smoke test untuk fungsi utama, bukan jaminan seluruh aplikasi bebas bug. Workflow tidak memasang dependency karena aplikasi Node demo tidak membutuhkannya. Node 22 dipilih eksplisit; action `setup-node@v6` menyiapkan runtime itu.

## 3. CI merah → diagnosis → hijau — 15 menit

Di **branch latihan**, ubah respons health dalam `node-demo/server.js`:

```js
JSON.stringify({ status: "rusak" })
```

Commit dan push, lalu amati PR:

1. Syntax check tetap lulus karena JavaScript masih valid.
2. HTTP test gagal karena respons tidak sesuai harapan.
3. Buka log step gagal dan temukan nilai expected `ok` dan actual `rusak`.
4. Kembalikan respons menjadi `ok` lalu push commit baru.
5. Pastikan run terbaru hijau sebelum menutup atau melanjutkan PR.

Bukti yang dikumpulkan: tautan run Hello, tautan CI gagal, dan tautan CI sukses setelah perbaikan. Tidak perlu merge eksperimen rusak.

## 4. Menghubungkan dengan materi Docker

Slide Docker, React, dan Compose adalah **potongan untuk diskusi lanjutan**, bukan workflow lengkap siap disalin. Letakkan dalam job setelah checkout dan lengkapi logs serta cleanup sebelum digunakan.

- Docker: build image → run container → tunggu respons → uji isi halaman.
- React: `npm ci` dan `npm run build` harus memakai `working-directory: react-demo`; cache lockfile saja tidak mengubah direktori kerja.
- Compose: gunakan `working-directory: compose-demo`, tunggu app/DB siap, cek health, lalu uji request root dan SQL bila ingin membuktikan penulisan counter.
- Cleanup: `if: always()` untuk container tes; `down --volumes` hanya pada proyek tes terisolasi karena menghapus data.
- Cache mempercepat pekerjaan; artifact menyimpan hasil run. File job A tidak otomatis tersedia di job B meski memakai `needs`.

Contoh cleanup container tertentu pada CI:

```yaml
- name: Log jika gagal
  if: failure()
  run: docker logs web-ci
- name: Cleanup
  if: always()
  run: |
    docker rm -f web-ci 2>/dev/null || true
    docker image rm docker-demo:ci 2>/dev/null || true
```

Jangan memakai global prune pada runner bersama. Dua lab pemula tidak membuat image/container/volume.

## 5. Gambaran deployment — materi lanjutan

Alur yang dituju: CI lulus → build image rilis → push ke registry → deploy ke server → cek layanan → rollback bila perlu.

Repository memiliki dua file deployment dengan perilaku berbeda:

| File | Trigger | Username Docker |
|---|---|---|
| `samples/github-actions/deploy-react-demo.yml` | Manual setelah diaktifkan | `vars.DOCKER_USERNAME` |
| `.github/workflows/deploy-react-demo.yml` | Push main dan manual | `secrets.DOCKER_USERNAME` |

Keduanya memakai job build-and-push lalu deploy; jangan menganggap sudah ada seluruh quality gate yang dijelaskan dalam rancangan CI/CD. Template deploy lama tidak dimodifikasi atau dijalankan dalam pembuatan materi ini.

Persiapan deploy memerlukan registry, token, server lab, SSH key, verifikasi fingerprint host, environment tujuan, health check, dan rencana rollback. Nama environment `production` tidak otomatis mengaktifkan approval; atur protection rule jika tersedia pada paket/visibilitas repo. Tag `sha-<commit>` membantu penelusuran tetapi dapat ditimpa; digest mengidentifikasi isi image. Mengganti satu container dapat menyebabkan downtime. Recovery perlu mencakup kegagalan pull/run dan verifikasi rollback, bukan hanya status HTTP awal.

## Troubleshooting dan evaluasi

| Gejala | Yang diperiksa |
|---|---|
| Tidak ada Run workflow | Path file, default branch, workflow_dispatch, akses tulis |
| File tidak ditemukan | Checkout, path file, working-directory |
| Job skipped | `needs`, `if`, atau dependency gagal |
| CI tetap merah | Step pertama gagal dan assertion expected/actual |
| Job queued | Kapasitas runner, policy, kuota, concurrency |
| PR tidak langsung jalan | Kebijakan/approval workflow untuk contributor atau fork |
| CI hijau tetapi masih bisa merge saat gagal berikutnya | Required status checks belum diatur pada proteksi branch |

Pertanyaan akhir: apa beda event/job/step/runner; mengapa checkout dibutuhkan; apakah CI hijau berarti bebas bug; apakah build image otomatis berarti sudah deploy?

Jawaban: event memicu; job adalah kelompok pekerjaan pada runner; step adalah langkahnya; runner adalah mesin eksekusi. Checkout mengambil source. CI hijau hanya membuktikan pemeriksaan yang ditulis lulus. Deploy memerlukan tahap penerapan hasil build ke environment tujuan.

## Validasi dan sumber

PPTX 32 slide telah dirender menjadi PDF dan ditinjau secara visual; batas shape dan catatan pengajar diperiksa. Sample smoke test diuji lokal menggunakan Node 22 dan berhasil; proses server dihentikan setelah tes. YAML diperiksa strukturnya, tetapi workflow **belum dijalankan pada GitHub-hosted runner**. Tidak ada push, deployment, atau perubahan workflow aktif yang dilakukan.

PPTX dibuat ulang menggunakan `scripts/build_github_actions_slides.py` dengan `python-pptx==1.0.2`. PPTX mengikuti pola ignore lama `*.pptx`, sehingga tersedia lokal tetapi tidak otomatis masuk Git.

Referensi resmi:

- [Konsep GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Menjalankan workflow manual](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
- [Checkout v6](https://github.com/actions/checkout/tree/v6)
- [Setup Node v6](https://github.com/actions/setup-node/tree/v6)
- [Artifact](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Deployment environment](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments)
