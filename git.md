# Version Control dengan Git: Dasar sampai Kolaborasi

Materi ini membahas version control menggunakan Git untuk kebutuhan pengembangan
aplikasi dan DevOps. Pembahasan dimulai dari konsep dasar, alur kerja sehari-hari,
branch dan merge, penggunaan remote repository seperti GitHub, sampai workflow
kolaborasi yang aman.

---

## Tujuan Pembelajaran

Setelah menyelesaikan materi ini, peserta mampu:

- menjelaskan fungsi version control dan perbedaan Git dengan GitHub;
- membuat repository serta mencatat perubahan dengan commit;
- membaca status, perbedaan, dan riwayat proyek;
- bekerja dengan branch, merge, dan konflik;
- menghubungkan repository lokal ke remote repository;
- membatalkan perubahan dengan cara yang sesuai;
- menggunakan workflow feature branch dan pull request dalam tim;
- menghindari masuknya secret dan file yang tidak diperlukan ke repository.

---

## 1. Pengenalan Version Control

**Version control system (VCS)** adalah sistem yang mencatat perubahan file dari
waktu ke waktu. Dengan version control, tim dapat mengetahui siapa yang mengubah
kode, perubahan apa yang dibuat, dan alasan perubahan tersebut.

Tanpa version control, proyek sering dikelola dengan salinan seperti:

```text
aplikasi-final/
aplikasi-final-revisi/
aplikasi-final-revisi-2/
aplikasi-final-benar/
```

Version control mengganti pola tersebut dengan riwayat perubahan yang terstruktur.

Manfaat utamanya:

- menyimpan riwayat perubahan proyek;
- mengembalikan perubahan yang bermasalah;
- memungkinkan beberapa orang bekerja secara paralel;
- membandingkan versi lama dan baru;
- membantu proses code review, CI/CD, dan deployment;
- memberi jejak audit tentang perubahan kode dan konfigurasi.

### Git dan GitHub Bukan Hal yang Sama

| Git | GitHub |
|---|---|
| Aplikasi version control | Layanan hosting repository Git |
| Berjalan di komputer lokal | Berjalan sebagai layanan di internet |
| Dapat dipakai tanpa koneksi internet | Membutuhkan koneksi untuk sinkronisasi |
| Mengelola commit, branch, dan merge | Menambahkan pull request, issue, review, dan Actions |

GitHub bukan satu-satunya layanan remote repository. Alternatifnya antara lain
GitLab, Bitbucket, dan server Git yang dikelola sendiri.

---

## 2. Cara Kerja Git

Git memiliki tiga area utama:

```text
Working directory       Staging area          Repository lokal
(file yang diedit)      (calon commit)         (riwayat commit)
        |                     |                       |
        |---- git add ------->|                       |
        |                     |---- git commit ------>|
```

| Area | Fungsi |
|---|---|
| Working directory | Tempat membuat dan mengedit file |
| Staging area | Memilih perubahan yang akan masuk ke commit berikutnya |
| Repository lokal | Menyimpan riwayat commit di folder `.git` |

Setiap commit memiliki identifier unik berupa hash, contohnya `7a21e4c`. Commit
menyimpan snapshot perubahan beserta author, waktu, dan pesan commit.

Status file yang umum:

- **untracked**: file baru yang belum dikenali Git;
- **modified**: file terlacak yang sudah berubah;
- **staged**: perubahan sudah dipilih untuk commit berikutnya;
- **committed**: perubahan sudah tersimpan dalam riwayat lokal.

---

## 3. Instalasi dan Konfigurasi Awal

### Instalasi

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install git
```

macOS dengan Homebrew:

```bash
brew install git
```

Windows dapat memasang Git dari https://git-scm.com/download/win. Instalasi ini
juga menyediakan Git Bash.

Verifikasi instalasi:

```bash
git --version
```

### Identitas Commit

Atur nama dan email yang akan dicatat pada commit:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "nama@example.com"
```

Atur nama branch awal menjadi `main`:

```bash
git config --global init.defaultBranch main
```

Periksa konfigurasi:

```bash
git config --global --list
```

Gunakan `--local` di dalam repository jika sebuah proyek memerlukan identitas
berbeda. Konfigurasi lokal hanya berlaku untuk repository tersebut dan menimpa
konfigurasi global.

```bash
git config --local user.email "nama@perusahaan.com"
```

---

## 4. Membuat Repository Pertama

Buat proyek latihan:

```bash
mkdir belajar-git
cd belajar-git
git init
```

Perintah `git init` membuat folder tersembunyi `.git` yang berisi metadata dan
riwayat repository. Jangan mengedit isi folder tersebut secara manual.

Buat file pertama:

```bash
echo "# Belajar Git" > README.md
git status
```

Git akan menampilkan `README.md` sebagai file **untracked**. Masukkan file ke
staging area, lalu buat commit:

```bash
git add README.md
git status
git commit -m "docs: tambah README awal"
```

Lihat riwayatnya:

```bash
git log
git log --oneline
```

### Membuka Repository yang Sudah Ada

Gunakan `git clone` untuk menyalin repository beserta riwayatnya:

```bash
git clone https://github.com/organisasi/nama-proyek.git
cd nama-proyek
```

Jangan menjalankan `git init` lagi setelah `git clone`; repository hasil clone
sudah memiliki folder `.git`.

---

## 5. Alur Kerja Sehari-hari

Alur paling umum adalah **edit, periksa, stage, lalu commit**.

Tambahkan isi ke proyek latihan:

```bash
mkdir docs
echo "Git mencatat perubahan proyek." > docs/catatan.md
```

Periksa keadaan repository:

```bash
git status
git diff
```

`git diff` menampilkan perubahan yang belum masuk staging area. Pilih perubahan:

```bash
git add docs/catatan.md
git diff --staged
```

`git diff --staged` menampilkan isi yang benar-benar akan masuk ke commit.

Simpan perubahan:

```bash
git commit -m "docs: tambah catatan dasar Git"
```

Siklus kerja yang disarankan:

```bash
git status
git diff
git add <file>
git diff --staged
git commit -m "pesan yang menjelaskan perubahan"
```

### Variasi `git add`

```bash
# Menambahkan satu file
git add README.md

# Menambahkan satu direktori
git add docs/

# Menambahkan seluruh perubahan dari direktori saat ini
git add .

# Memilih bagian perubahan secara interaktif
git add -p
```

Jangan langsung memakai `git add .` tanpa memeriksa `git status` dan `git diff`.
File sementara atau secret dapat ikut masuk tanpa sengaja.

---

## 6. Membaca Perubahan dan Riwayat

### Status dan Perbedaan

```bash
git status                 # Status lengkap
git status --short         # Status ringkas
git diff                   # Perubahan yang belum di-stage
git diff --staged          # Perubahan yang sudah di-stage
git diff HEAD~1 HEAD        # Perbedaan dua commit
git diff main..fitur-login  # Perbedaan dua branch
```

Contoh status ringkas:

```text
 M README.md
A  docs/instalasi.md
?? catatan-pribadi.txt
```

Kolom kiri menunjukkan status staging area dan kolom kanan menunjukkan status
working directory. `??` berarti file belum dilacak.

### Riwayat Commit

```bash
git log
git log --oneline
git log --oneline --graph --decorate --all
git show <hash-commit>
git show --stat <hash-commit>
git blame README.md
```

`git blame` membantu menemukan commit terakhir yang mengubah setiap baris. Gunakan
hasilnya sebagai titik awal memahami konteks, bukan untuk menyalahkan seseorang.

### Mencari Riwayat

```bash
# Mencari teks pada pesan commit
git log --grep="login"

# Mencari commit yang menambah atau menghapus teks tertentu
git log -S "namaFungsi"

# Melihat riwayat sebuah file, termasuk saat namanya berubah
git log --follow -- README.md
```

---

## 7. Menulis Commit yang Baik

Satu commit sebaiknya mewakili satu perubahan logis. Hindari mencampur perbaikan
bug, format seluruh proyek, dan fitur baru dalam satu commit.

Contoh pesan yang kurang jelas:

```text
update
fix
revisi lagi
```

Contoh pesan yang lebih baik:

```text
fix: cegah login dengan password kosong
feat: tambah endpoint health check
docs: jelaskan proses deployment
refactor: pisahkan validasi konfigurasi
```

Prinsip pesan commit:

- gunakan kalimat singkat dan spesifik;
- jelaskan tujuan perubahan, bukan hanya nama file;
- gunakan bentuk perintah, misalnya `tambah`, `perbaiki`, atau `hapus`;
- tambahkan body bila alasan atau dampaknya perlu dijelaskan.

Commit dengan body:

```bash
git commit
```

Editor akan terbuka. Baris pertama menjadi ringkasan, lalu beri satu baris kosong
sebelum penjelasan lebih panjang.

---

## 8. `.gitignore`

File `.gitignore` menentukan file atau direktori yang tidak perlu dilacak Git.

Contoh untuk proyek umum:

```gitignore
# Dependency
node_modules/
vendor/

# Build output
dist/
build/

# Environment dan secret
.env
.env.*
!.env.example

# Log dan file editor/OS
*.log
.DS_Store
.idea/
.vscode/
```

Aturan penting:

- `/dist/` hanya mengabaikan `dist` di root repository;
- `dist/` mengabaikan direktori bernama `dist` pada semua level;
- `*.log` mengabaikan semua file dengan ekstensi `.log`;
- `!file` mengecualikan file dari aturan ignore sebelumnya.

Periksa alasan sebuah file diabaikan:

```bash
git check-ignore -v .env
```

`.gitignore` tidak berpengaruh pada file yang sudah dilacak. Hentikan pelacakan
tanpa menghapus file lokal dengan:

```bash
git rm --cached .env
git commit -m "chore: hentikan pelacakan file environment"
```

Jika `.env` pernah berisi secret dan sudah masuk commit, anggap secret tersebut
telah bocor: segera cabut atau rotasi kredensial. Menghapus file dari commit terbaru
tidak menghapusnya dari seluruh riwayat.

---

## 9. Branch dan Merge

Branch memungkinkan pengembangan fitur berlangsung terpisah dari branch utama.

```text
main       A---B-----------E
                \         /
fitur-login      C---D----
```

### Membuat Branch

```bash
# Melihat daftar branch
git branch

# Membuat dan langsung berpindah ke branch baru
git switch -c fitur-login

# Melihat branch aktif
git status
```

Buat perubahan dan commit seperti biasa:

```bash
echo "Panduan login" > docs/login.md
git add docs/login.md
git commit -m "docs: tambah panduan login"
```

### Menggabungkan Branch

Kembali ke `main`, lalu gabungkan fitur:

```bash
git switch main
git merge fitur-login
```

Setelah branch selesai digabungkan:

```bash
git branch -d fitur-login
```

Opsi `-d` menolak menghapus branch yang belum tergabung. Opsi `-D` memaksa
penghapusan dan berisiko menghilangkan commit yang belum memiliki referensi lain.

### Nama Branch

Gunakan nama singkat yang menjelaskan pekerjaan:

```text
feature/login
fix/timeout-api
docs/panduan-deploy
chore/update-dependency
```

Ikuti konvensi tim bila proyek sudah memilikinya.

---

## 10. Menyelesaikan Merge Conflict

Conflict muncul ketika Git tidak dapat menentukan cara menggabungkan perubahan,
misalnya dua branch mengubah bagian yang sama pada sebuah file.

Saat conflict terjadi:

```bash
git status
```

Git memberi penanda di dalam file:

```text
<<<<<<< HEAD
Teks dari branch saat ini
=======
Teks dari branch yang digabungkan
>>>>>>> fitur-login
```

Langkah penyelesaian:

1. Buka setiap file yang conflict.
2. Tentukan isi akhir yang benar.
3. Hapus semua penanda `<<<<<<<`, `=======`, dan `>>>>>>>`.
4. Jalankan test atau validasi yang relevan.
5. Tandai file sebagai selesai dengan `git add`.
6. Selesaikan merge dengan `git commit`.

```bash
git add README.md
git commit
```

Untuk membatalkan proses merge dan kembali ke kondisi sebelum merge:

```bash
git merge --abort
```

Jangan memilih seluruh perubahan dari satu sisi tanpa memahami dampaknya. Hasil
conflict resolution harus merupakan isi akhir yang benar, dan dapat berupa gabungan
kedua sisi.

---

## 11. Remote Repository dan GitHub

Remote adalah referensi ke repository lain. Nama remote utama biasanya `origin`.

```bash
# Melihat remote
git remote -v

# Menambahkan remote
git remote add origin git@github.com:organisasi/nama-proyek.git

# Mengubah URL remote
git remote set-url origin git@github.com:organisasi/nama-proyek.git
```

### Autentikasi SSH ke GitHub

Buat pasangan SSH key jika belum memilikinya:

```bash
ssh-keygen -t ed25519 -C "nama@example.com"
```

Tampilkan public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Tambahkan **public key** tersebut ke pengaturan SSH key pada akun GitHub. Jangan
pernah membagikan file private key `~/.ssh/id_ed25519`.

Uji koneksi:

```bash
ssh -T git@github.com
```

### Push, Fetch, dan Pull

```bash
# Mengirim main dan menetapkan upstream
git push -u origin main

# Mengambil informasi terbaru tanpa mengubah working directory
git fetch origin

# Mengambil lalu menggabungkan perubahan branch upstream
git pull

# Mengirim commit lokal
git push
```

Perbedaannya:

| Perintah | Mengunduh data | Mengubah branch aktif |
|---|---:|---:|
| `git fetch` | Ya | Tidak |
| `git pull` | Ya | Ya, melalui merge atau rebase sesuai konfigurasi |
| `git push` | Tidak | Mengirim commit lokal ke remote |

Workflow yang lebih mudah diperiksa:

```bash
git fetch origin
git log --oneline HEAD..origin/main
git diff HEAD..origin/main
git merge origin/main
```

### Remote-tracking Branch

Nama seperti `origin/main` adalah catatan lokal tentang keadaan branch `main` pada
remote saat `fetch` terakhir. Jalankan `git fetch` agar catatan tersebut diperbarui.

---

## 12. Membatalkan Perubahan dengan Aman

Pilih perintah berdasarkan posisi perubahan.

### Perubahan Belum di-Stage

```bash
# Melihat perubahan terlebih dahulu
git diff README.md

# Mengembalikan file ke versi commit terakhir
git restore README.md
```

`git restore` akan membuang perubahan lokal pada file tersebut. Pastikan isinya
memang tidak diperlukan.

### Perubahan Sudah di-Stage

Keluarkan file dari staging area tanpa membuang editannya:

```bash
git restore --staged README.md
```

### Commit Terakhir Belum Dikirim

Tambahkan file yang tertinggal atau perbaiki pesan commit:

```bash
git add file-yang-tertinggal.md
git commit --amend
```

`--amend` mengganti commit terakhir dengan commit baru. Hindari amend pada commit
yang sudah dipakai orang lain karena hash commit berubah.

### Commit Sudah Dibagikan

Buat commit baru yang membalikkan perubahan:

```bash
git revert <hash-commit>
```

`git revert` mempertahankan riwayat dan aman untuk branch bersama.

### Tentang `git reset`

`git reset` memindahkan penunjuk branch dan memiliki beberapa mode:

```bash
git reset --soft HEAD~1   # Commit batal, perubahan tetap staged
git reset --mixed HEAD~1  # Commit batal, perubahan tetap di working directory
git reset --hard HEAD~1   # Commit dan perubahan lokal dibuang
```

Gunakan `reset` hanya jika memahami konsekuensinya, terutama `--hard`. Jangan
menulis ulang riwayat branch bersama tanpa kesepakatan tim.

---

## 13. Menyimpan Pekerjaan Sementara dengan Stash

Stash berguna ketika pekerjaan belum siap di-commit tetapi perlu berpindah branch.

```bash
# Menyimpan perubahan file yang sudah dilacak
git stash push -m "WIP validasi login"

# Menyertakan file untracked
git stash push -u -m "WIP validasi login"

# Melihat daftar stash
git stash list

# Melihat isi stash
git stash show -p stash@{0}

# Menerapkan tanpa menghapus stash
git stash apply stash@{0}

# Menerapkan dan menghapus stash jika berhasil
git stash pop

# Menghapus stash tertentu
git stash drop stash@{0}
```

Stash adalah tempat sementara, bukan pengganti commit atau backup jangka panjang.

---

## 14. Tag dan Versi Rilis

Tag memberi nama tetap pada commit tertentu, biasanya untuk menandai rilis.

```bash
# Membuat annotated tag
git tag -a v1.0.0 -m "Rilis versi 1.0.0"

# Melihat tag
git tag
git show v1.0.0

# Mengirim satu tag
git push origin v1.0.0

# Mengirim semua tag lokal
git push origin --tags
```

Format versi yang umum mengikuti Semantic Versioning:

```text
MAJOR.MINOR.PATCH
  2  .  3  .  1
```

- **MAJOR**: perubahan tidak kompatibel dengan versi sebelumnya;
- **MINOR**: fitur baru yang tetap kompatibel;
- **PATCH**: perbaikan bug yang kompatibel.

Jangan memindahkan tag rilis yang sudah dipublikasikan. Buat versi baru agar proses
build dan deployment tetap dapat dilacak dengan jelas.

---

## 15. Rebase dan Cherry-pick

Bagian ini digunakan setelah alur branch dan merge sudah dipahami.

### Rebase

Rebase memindahkan commit suatu branch ke atas commit dasar yang baru:

```bash
git switch fitur-login
git fetch origin
git rebase origin/main
```

Jika ada conflict:

```bash
# Perbaiki file conflict, kemudian:
git add <file>
git rebase --continue

# Atau batalkan seluruh rebase
git rebase --abort
```

Rebase menulis ulang commit dan menghasilkan hash baru. Jangan melakukan rebase
pada branch bersama yang sedang dipakai orang lain.

### Cherry-pick

Cherry-pick menyalin satu commit tertentu ke branch aktif:

```bash
git switch main
git cherry-pick <hash-commit>
```

Gunakan untuk kebutuhan spesifik seperti membawa satu perbaikan ke branch rilis.
Untuk alur pengembangan normal, merge atau rebase biasanya lebih mudah dilacak.

---

## 16. Workflow Kolaborasi Tim

Workflow feature branch yang sederhana:

```text
1. Sinkronkan main
2. Buat feature branch
3. Buat commit kecil dan terfokus
4. Push branch
5. Buka pull request
6. Jalankan CI dan code review
7. Gabungkan pull request
8. Hapus branch yang selesai
```

Contoh perintah:

```bash
git switch main
git pull --ff-only
git switch -c feature/health-check

# Edit, test, lalu commit
git add .
git commit -m "feat: tambah endpoint health check"

git push -u origin feature/health-check
```

Setelah push, buka pull request di GitHub. Pull request sebaiknya berisi:

- judul yang menjelaskan hasil perubahan;
- alasan atau konteks perubahan;
- cara menguji perubahan;
- dampak, risiko, atau langkah migrasi bila ada;
- screenshot untuk perubahan antarmuka bila relevan.

Sebelum menggabungkan pull request:

- pastikan test dan pemeriksaan CI lulus;
- selesaikan komentar review;
- periksa tidak ada secret atau file sementara;
- pastikan perubahan cukup kecil untuk ditinjau dengan baik;
- gunakan aturan merge yang disepakati tim.

### Merge, Squash, atau Rebase Merge

| Strategi | Hasil | Cocok ketika |
|---|---|---|
| Merge commit | Riwayat dan bentuk branch dipertahankan | Tim ingin konteks branch lengkap |
| Squash merge | Semua commit PR menjadi satu commit | Commit selama pengerjaan masih berantakan |
| Rebase merge | Commit PR disusun linear di atas target | Tim menginginkan riwayat linear |

Tidak ada strategi yang selalu paling baik. Pilih satu konvensi dan gunakan secara
konsisten dalam tim.

---

## 17. Keamanan dan Praktik Terbaik

1. Jangan commit password, token API, private key, atau isi `.env`.
2. Sediakan `.env.example` berisi nama variable tanpa nilai rahasia.
3. Periksa `git diff --staged` sebelum setiap commit.
4. Jangan memaksa push ke branch bersama kecuali tim memang mengizinkannya.
5. Lindungi branch utama dengan pull request, review, dan pemeriksaan CI.
6. Tandatangani commit atau tag jika proyek membutuhkan verifikasi identitas.
7. Simpan file besar di artifact storage atau Git LFS, bukan Git biasa.
8. Jangan memasukkan dependency, build output, log, atau file editor ke repository.
9. Buat commit kecil yang dapat diuji dan mudah dikembalikan.
10. Tarik perubahan terbaru sebelum memulai pekerjaan baru.

Jika benar-benar perlu memperbarui branch pribadi yang sudah di-rebase, gunakan:

```bash
git push --force-with-lease
```

`--force-with-lease` lebih aman daripada `--force` karena menolak push jika remote
berubah tanpa sepengetahuan lokal. Tetap jangan gunakan pada branch bersama tanpa
koordinasi.

---

## 18. Troubleshooting Umum

### Push Ditolak karena Remote Lebih Baru

```text
! [rejected] main -> main (non-fast-forward)
```

Periksa dan integrasikan perubahan remote:

```bash
git fetch origin
git log --oneline --graph --decorate --all
git pull --rebase
git push
```

Gunakan merge sebagai pengganti rebase bila itu konvensi tim.

### Salah Branch tetapi Belum Commit

Jika branch tujuan dapat menerima perubahan tanpa conflict:

```bash
git switch branch-yang-benar
```

Jika Git menolak perpindahan, simpan sementara:

```bash
git stash push -u -m "pindah ke branch yang benar"
git switch branch-yang-benar
git stash pop
```

### Commit Masuk ke Branch yang Salah

Catat hash commit, pindah branch, lalu cherry-pick:

```bash
git log -1 --oneline
git switch branch-yang-benar
git cherry-pick <hash-commit>
```

Setelah commit aman di branch tujuan, rapikan branch asal sesuai kondisi dan
kebijakan tim. Gunakan `revert` jika commit sudah dibagikan.

### File Seharusnya Diabaikan tetapi Tetap Muncul

Periksa apakah file sudah dilacak:

```bash
git ls-files --error-unmatch path/to/file
git check-ignore -v path/to/file
```

Jika sudah dilacak:

```bash
git rm --cached path/to/file
git commit -m "chore: hentikan pelacakan file lokal"
```

### Commit Terlihat Hilang

Git menyimpan catatan perpindahan `HEAD` untuk sementara:

```bash
git reflog
git show <hash-yang-ditemukan>
```

Setelah memastikan commit yang benar, buat branch pemulihan:

```bash
git branch recovery/<nama> <hash-yang-ditemukan>
```

---

## 19. Latihan Praktik

### Latihan 1: Repository dan Commit

1. Buat folder `latihan-version-control`.
2. Jalankan `git init`.
3. Buat `README.md` berisi nama dan tujuan proyek.
4. Buat commit pertama.
5. Tambahkan `.gitignore` dan commit kembali.
6. Tampilkan riwayat dengan format satu baris.

Target akhir:

```bash
git log --oneline
# <hash> chore: tambah gitignore
# <hash> docs: tambah README awal
```

### Latihan 2: Branch dan Conflict

1. Buat branch `feature/profil`.
2. Tambahkan bagian profil ke `README.md`, lalu commit.
3. Kembali ke `main` dan ubah baris yang sama, lalu commit.
4. Merge `feature/profil` ke `main`.
5. Selesaikan conflict dan periksa hasil akhirnya.

### Latihan 3: Kolaborasi Remote

1. Buat repository kosong di GitHub tanpa README tambahan.
2. Tambahkan remote `origin` ke repository latihan.
3. Push branch `main`.
4. Buat feature branch dan satu commit baru.
5. Push branch tersebut dan buka pull request.
6. Gabungkan pull request setelah perubahan diperiksa.

### Tantangan

- Pulihkan perubahan file yang belum di-stage menggunakan `git restore`.
- Keluarkan file dari staging area tanpa membuang isinya.
- Buat tag `v1.0.0` pada commit terakhir.
- Temukan commit tertentu dengan `git log --grep`.
- Buat perubahan sementara, simpan dengan stash, lalu terapkan kembali.

---

## 20. Ringkasan Perintah Cepat

```bash
git init                            # Membuat repository lokal
git clone <url>                     # Menyalin repository
git status                          # Melihat status perubahan
git diff                            # Melihat perubahan belum staged
git diff --staged                   # Melihat perubahan yang akan di-commit
git add <file>                      # Memasukkan perubahan ke staging area
git commit -m "pesan"               # Membuat commit
git log --oneline --graph --all     # Melihat riwayat ringkas
git switch -c <branch>              # Membuat dan pindah branch
git switch <branch>                 # Berpindah branch
git merge <branch>                  # Menggabungkan branch
git branch -d <branch>              # Menghapus branch yang sudah tergabung
git remote -v                       # Melihat remote
git fetch origin                    # Mengambil informasi remote
git pull                            # Mengambil dan mengintegrasikan perubahan
git push -u origin <branch>         # Push pertama dan atur upstream
git push                            # Mengirim commit berikutnya
git restore <file>                  # Membuang perubahan belum staged
git restore --staged <file>         # Mengeluarkan perubahan dari staging
git revert <commit>                 # Membalik commit dengan commit baru
git stash push -u -m "pesan"        # Menyimpan pekerjaan sementara
git tag -a v1.0.0 -m "Rilis 1.0.0"  # Menandai versi rilis
git reflog                          # Melihat riwayat perpindahan HEAD
```

---

## Referensi

- Dokumentasi resmi Git: https://git-scm.com/docs
- Buku Pro Git (gratis): https://git-scm.com/book/en/v2
- Dokumentasi GitHub tentang Git: https://docs.github.com/en/get-started/using-git
- Visualisasi branch interaktif: https://learngitbranching.js.org
- Semantic Versioning: https://semver.org
- Materi lanjutan otomasi repository: [github-actions.md](github-actions.md)
