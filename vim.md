# Materi Vim: Dasar sampai Advanced

Vim adalah text editor berbasis terminal yang hampir selalu tersedia di server Linux. Menguasai Vim penting untuk DevOps karena sering kali kita hanya punya akses SSH tanpa GUI, misalnya saat mengedit file konfigurasi seperti `/etc/nginx/nginx.conf` atau `/etc/ssh/sshd_config`.

---

## 1. Konsep Dasar: Modal Editor

Vim berbeda dari editor biasa (nano, VS Code) karena bersifat **modal** — punya beberapa mode dengan fungsi berbeda:

| Mode | Fungsi | Cara masuk |
|------|--------|------------|
| **Normal** | Mode default, untuk navigasi dan perintah | `Esc` |
| **Insert** | Mode untuk mengetik teks | `i`, `a`, `o`, dll (dari Normal) |
| **Visual** | Mode untuk menyeleksi teks | `v`, `V`, `Ctrl+v` |
| **Command-line** | Mode untuk menjalankan perintah (save, quit, replace) | `:` |

> 💡 Aturan emas Vim: **selalu kembali ke Normal mode (`Esc`) sebelum menjalankan perintah lain.** Sebagian besar kebingungan pemula berasal dari lupa mode saat ini.

---

## 2. Membuka, Menyimpan, Keluar

```bash
# Membuka file
vim namafile.txt

# Membuka file langsung ke baris tertentu
vim +42 namafile.txt
```

Perintah dasar (ketik di Normal mode, diawali `:`):

```
:w          Simpan (write)
:q          Keluar (quit)
:wq         Simpan lalu keluar
:x          Sama seperti :wq, tapi hanya menulis jika ada perubahan
:q!         Keluar tanpa menyimpan (paksa)
:w namafile Simpan sebagai file baru (save as)
ZZ          Shortcut untuk :wq (langsung di Normal mode, tanpa titik dua)
```

---

## 3. Masuk ke Insert Mode

Semua perintah ini dijalankan dari **Normal mode** dan langsung masuk ke Insert mode:

```
i     Insert sebelum kursor
a     Insert setelah kursor (append)
I     Insert di awal baris
A     Insert di akhir baris
o     Buat baris baru di bawah, lalu insert
O     Buat baris baru di atas, lalu insert
```

Setelah selesai mengetik, tekan `Esc` untuk kembali ke Normal mode.

---

## 4. Navigasi Dasar

```
h   kiri
j   bawah
k   atas
l   kanan
```

> 💡 Kenapa tidak pakai arrow key? Karena `hjkl` sejajar dengan posisi jari di keyboard (home row), sehingga navigasi jadi lebih cepat tanpa memindahkan tangan.

Navigasi per kata dan baris:

```
w       Loncat ke awal kata berikutnya
b       Loncat ke awal kata sebelumnya
e       Loncat ke akhir kata
0       Loncat ke awal baris (kolom pertama)
^       Loncat ke karakter non-spasi pertama di baris
$       Loncat ke akhir baris
```

Navigasi per layar dan file:

```
gg      Loncat ke awal file
G       Loncat ke akhir file
5G      Loncat ke baris 5
Ctrl+d  Scroll setengah layar ke bawah
Ctrl+u  Scroll setengah layar ke atas
Ctrl+f  Scroll satu layar ke bawah
Ctrl+b  Scroll satu layar ke atas
```

---

## 5. Edit Dasar

```
x       Hapus 1 karakter di kursor
dd      Hapus 1 baris (cut)
dw      Hapus 1 kata
D       Hapus dari kursor sampai akhir baris
yy      Copy 1 baris (yank)
yw      Copy 1 kata
p       Paste setelah kursor / baris di bawah
P       Paste sebelum kursor / baris di atas
u       Undo
Ctrl+r  Redo
.       Ulangi perintah terakhir (sangat berguna!)
```

### Menggabungkan Angka + Perintah

Vim mendukung pola **[jumlah][perintah]** — ini kunci efisiensi Vim:

```
3dd     Hapus 3 baris
5j      Turun 5 baris
2yy     Copy 2 baris
10x     Hapus 10 karakter
```

### Menggabungkan Perintah + Motion (Operator + Motion)

Perintah seperti `d` (delete), `y` (yank/copy), `c` (change) bisa digabung dengan motion (perintah navigasi):

```
dw      Delete sampai awal kata berikutnya
d$      Delete sampai akhir baris
d0      Delete sampai awal baris
dG      Delete sampai akhir file
cw      Change word (hapus kata lalu masuk Insert mode)
ciw     Change inner word (ganti kata di bawah kursor, tanpa perlu di awal kata)
```

---

## 6. Visual Mode (Seleksi Teks)

```
v       Visual mode karakter
V       Visual mode baris penuh
Ctrl+v  Visual block mode (seleksi kolom, berguna untuk edit banyak baris sekaligus)
```

Setelah menyeleksi dengan `v`/`V`/`Ctrl+v`, jalankan aksi:

```
d       Hapus seleksi
y       Copy seleksi
>       Tambah indentasi
<       Kurangi indentasi
```

---

## 7. Search dan Replace

### Pencarian

```
/kata       Cari "kata" maju (ke bawah)
?kata       Cari "kata" mundur (ke atas)
n           Loncat ke hasil pencarian berikutnya
N           Loncat ke hasil pencarian sebelumnya
```

### Find & Replace (Substitute)

```
:s/lama/baru/           Ganti kemunculan pertama di baris saat ini
:s/lama/baru/g          Ganti semua kemunculan di baris saat ini
:%s/lama/baru/g         Ganti semua kemunculan di seluruh file
:%s/lama/baru/gc        Sama seperti di atas, tapi minta konfirmasi tiap ganti
:5,10s/lama/baru/g      Ganti hanya di baris 5 sampai 10
```

Contoh nyata (mengganti port di file konfigurasi):

```
:%s/8080/3000/g
```

---

## 8. Bekerja dengan Banyak File (Buffer, Split, Tab)

```bash
# Membuka beberapa file sekaligus
vim file1.txt file2.txt
```

```
:bn         Pindah ke buffer (file) berikutnya
:bp         Pindah ke buffer sebelumnya
:ls         Lihat daftar buffer yang terbuka
:b2         Pindah ke buffer nomor 2
```

### Split Window

```
:sp file.txt    Split horizontal, buka file.txt
:vsp file.txt   Split vertical, buka file.txt
Ctrl+w w        Pindah antar window
Ctrl+w q        Tutup window aktif
```

### Tab

```
:tabnew file.txt   Buka file di tab baru
gt                 Pindah ke tab berikutnya
gT                 Pindah ke tab sebelumnya
```

---

## 9. Macro (Merekam dan Mengulang Perintah)

Macro sangat berguna untuk mengulang satu urutan edit ke banyak baris.

```
qa          Mulai merekam macro, simpan ke register "a"
...         (lakukan perintah edit apapun)
q           Berhenti merekam
@a          Jalankan macro "a"
@@          Ulangi macro terakhir yang dijalankan
10@a        Jalankan macro "a" sebanyak 10 kali
```

**Contoh kasus:** menambahkan `- ` di awal 20 baris untuk membuat list markdown:

```
qa      " mulai rekam ke register a
I- <Esc>j   " tambah "- " di awal baris, lalu turun satu baris
q       " stop rekam
19@a    " ulangi 19 kali lagi (total 20 baris)
```

---

## 10. Register (Clipboard Vim)

Vim punya banyak "clipboard" yang disebut register.

```
"ayy    Copy baris ke register "a"
"ap     Paste dari register "a"
"+y     Copy ke clipboard sistem (perlu vim dengan dukungan clipboard)
"+p     Paste dari clipboard sistem
:reg    Lihat semua isi register
```

---

## 11. Konfigurasi Vim (`~/.vimrc`)

Pengaturan Vim disimpan di file `~/.vimrc`. Contoh konfigurasi dasar yang umum dipakai:

```vim
" Tampilkan nomor baris
set number

" Highlight hasil pencarian
set hlsearch
set incsearch

" Gunakan spasi, bukan tab, dengan lebar 4
set expandtab
set tabstop=4
set shiftwidth=4

" Auto indent mengikuti baris sebelumnya
set autoindent

" Highlight syntax sesuai tipe file
syntax on

" Tampilkan posisi kursor (baris, kolom) di pojok bawah
set ruler

" Izinkan berpindah buffer tanpa harus save dulu
set hidden
```

Setelah diedit, reload konfigurasi tanpa keluar Vim:

```
:source ~/.vimrc
```

---

## 12. Tips Praktis untuk DevOps

```
:set paste      Nonaktifkan auto-indent sementara (berguna sebelum paste dari luar)
:set nopaste    Aktifkan lagi setelah selesai paste
:!ls            Jalankan perintah shell tanpa keluar dari Vim
:r !whoami      Sisipkan output perintah shell ke dalam file
gg=G            Auto-indent ulang seluruh file
:set ft=nginx   Set syntax highlighting secara manual (jika file tidak dikenali otomatis)
```

**Contoh alur kerja umum:** mengedit `/etc/nginx/nginx.conf` lewat SSH.

```bash
sudo vim /etc/nginx/nginx.conf
```

```
/server_name        " cari baris server_name
ciw                 " ganti kata di bawah kursor
domainbaru.com<Esc> " ketik domain baru
:wq                 " simpan dan keluar
```

```bash
sudo systemctl restart nginx
```

---

## 13. Cheat Sheet Ringkas

| Kategori | Perintah | Fungsi |
|----------|----------|--------|
| Keluar | `:wq` / `:q!` | Simpan+keluar / paksa keluar |
| Insert | `i` / `a` / `o` | Insert sebelum / sesudah / baris baru |
| Hapus | `dd` / `x` / `dw` | Baris / karakter / kata |
| Copy-Paste | `yy` / `p` | Copy baris / paste |
| Undo | `u` / `Ctrl+r` | Undo / redo |
| Cari | `/kata` / `n` | Cari / lanjut cari |
| Ganti | `:%s/a/b/g` | Replace semua di file |
| Ulangi | `.` | Ulangi perintah terakhir |
| Macro | `qa...q` / `@a` | Rekam / jalankan macro |

---

## Referensi

- Bawaan Vim: jalankan `vimtutor` di terminal untuk tutorial interaktif langsung dari dalam Vim.
- Repository pembelajaran: https://github.com/DistritekDevOps/learning-devops
