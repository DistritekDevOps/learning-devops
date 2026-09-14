# Analisis dan revisi materi Docker

Materi asli 18 slide sudah memiliki alur topik dan empat contoh yang relevan. Tata letak awal cukup bersih. Perbaikan berfokus pada ketepatan penjelasan, panduan praktik, dan pengantar untuk peserta yang baru mengenal Docker.

Hasil: **materi-docker-revisi.pptx** (33 slide) dan **praktik-docker.md**. PPTX asli dipertahankan. Identitas Muhammad Asdar / Distritek DevOps tetap digunakan. Pengantar menjelaskan masalah perbedaan lingkungan, fungsi Docker, analogi Dockerfile/image/container, dan arti runtime/dependensi. Panduan menyertakan naskah pembuka pengajar.

## Temuan dan perbaikan

| Slide asli | Temuan | Perbaikan |
|---|---|---|
| 4 | Hasil di semua mesin diklaim identik | Jelaskan batas platform, konfigurasi runtime, dan layanan eksternal |
| 4 | Container dianggap hanya instance berjalan | Container dapat running maupun stopped |
| 5 | Ukuran dan waktu startup dianggap tetap | Gunakan perbandingan relatif; catatan VM Linux pada Desktop |
| 6, 14 | Podman dianggap sama persis | Jelaskan perbedaan runtime dan Compose provider |
| 6 | Prasyarat belum mengecek daemon/Compose | Cek Client + Server, Compose version, hello-world |
| 8, 17 | Bash tidak selalu tersedia pada Alpine | Gunakan sh |
| 8, 17 | Cleanup global system prune -a | Ganti cleanup resource latihan berdasarkan nama |
| 9 | FROM diklaim selalu baris pertama | Jelaskan ARG/parser directive dapat mendahului FROM |
| 9 | Prasyarat npm ci belum dijelaskan | Jelaskan lockfile dan build context; lockfile demo sudah ada sejak awal |
| 10, 16 | Ukuran React 63 MB dianggap tetap | Ukur hasil pada mesin peserta |
| 11 | Contoh MySQL tanpa password inisialisasi | Praktik memakai contoh PostgreSQL lengkap dari repo |
| 12 | DNS nama container dianggap berlaku di semua network | Jelaskan user-defined network |
| 13 | Compose menghilangkan kredensial dan healthcheck yang dirujuk | Beri label potongan app/DB dan gunakan file lengkap di repo |
| 15–17 | Praktik sebatas daftar demo/perintah | Tambahkan langkah, target hasil, tantangan, troubleshooting, dan cleanup |

Revisi 33 slide memuat tujuan belajar, pengantar pemula, diagram, estimasi kelas 150 menit, empat lab, evaluasi, serta catatan fasilitator. Pengantar termasuk jatah konsep 25 menit.

## Sample yang diperbaiki

- Node: `/health`, respons 404 untuk route tak dikenal, listen pada `0.0.0.0`.
- Compose app: health membaca `SELECT 1` tanpa menambah counter; respons 503 ketika database gagal; timeout query/koneksi; penanganan error pool idle dan startup.
- Compose config: healthcheck app, port localhost, kredensial ditandai khusus latihan.
- `.dockerignore`: pengecualian `.env`, secret, dan file tidak relevan.
- README: petunjuk browser, port eksperimen tanpa bentrok, batas kompatibilitas Podman, dan tautan panduan praktik.
- `docker.md`: tautan hasil revisi, prasyarat lockfile, dan pembeda ilustrasi MySQL dengan demo PostgreSQL.

Lockfile sebenarnya sudah ada sejak awal. Perubahan metadata sementara oleh npm dibatalkan karena tidak diperlukan.

## Validasi

Tes menggunakan **Podman 6.0.1 arm64** dengan **Docker Compose provider 5.3.1**, bukan Docker Engine langsung.

| Tes | Hasil |
|---|---|
| Build empat Dockerfile, termasuk npm ci dan React build | Lulus |
| Statis: HTML melalui HTTP | Lulus |
| React: fallback `/materi`; runtime tanpa Node | Lulus |
| Node: JSON, env PORT=4000, dua hostname, non-root | Lulus |
| Node health | HTTP 200 / status ok |
| App mengakses PostgreSQL melalui hostname db | Lulus |
| Dua request menghasilkan dua baris; health tidak menambah counter | Lulus |
| DB dihentikan lalu dijalankan kembali | HTTP 503 lalu 200; data tetap |
| Container DB dibuat ulang dengan volume sama | Jumlah baris tetap |
| Compose config, up/down/up pada proyek sementara | Lulus; jumlah baris tetap 1 |
| Syntax JavaScript | node --check lulus |
| Presentasi | Versi awal revisi dirender dan ditinjau; versi akhir diperiksa secara struktural |

Batas validasi: interaksi UI React di browser belum diuji otomatis. Status healthy dan perilaku --wait perlu dicek pada Docker Engine tujuan karena provider Podman dapat berbeda. npm ci pada host mengalami error npm, sedangkan build bersih dalam container berhasil. Npm melaporkan **6 temuan dependency React (4 moderate, 2 high)** saat build; belum ditriase atau diperbaiki dalam revisi pembelajaran ini. Sample ditujukan untuk latihan lokal.

Render PDF terakhir ditolak pada permintaan eksekusi LibreOffice. PDF sebelumnya dihapus agar tidak dibagikan sebagai versi final yang tidak sesuai. PPTX final mencakup pengantar tambahan, tetapi belum dirender ulang setelah perubahan terakhir.

## Cleanup dan reproduksi

Semua container, network, volume, image aplikasi, layer build perantara, dan image dasar yang dibuat/diunduh untuk tes telah dihapus. Daftar resource diperiksa kembali; resource lama pengguna dipertahankan.

Generator presentasi tersedia di `scripts/build_docker_slides.py`:

```bash
python3 -m venv /tmp/docker-slides-venv
/tmp/docker-slides-venv/bin/pip install python-pptx==1.0.2
/tmp/docker-slides-venv/bin/python scripts/build_docker_slides.py
```

PPTX mengikuti `.gitignore` lama (`*.pptx`): tersedia lokal, tetapi tidak otomatis masuk Git.

Referensi: [Dockerfile](https://docs.docker.com/reference/dockerfile/), [Compose startup](https://docs.docker.com/compose/how-tos/startup-order/), [Compose services](https://docs.docker.com/reference/compose-file/services/), [volumes](https://docs.docker.com/engine/storage/volumes/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
