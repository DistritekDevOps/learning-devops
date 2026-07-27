# General Dashboard Design System

Dokumen ini adalah panduan desain dashboard yang bersifat umum. Referensi visual
utama berasal dari [TailAdmin Demo](https://demo.tailadmin.com/), dengan peninjauan
pada dashboard e-commerce, analytics, form elements, data tables, cards, dan
authentication.

Tujuannya bukan menyalin identitas, aset, atau implementasi TailAdmin, melainkan
merangkum pola desain dashboard modern yang dapat diterapkan pada berbagai produk,
framework, dan domain bisnis.

## 1. Karakter desain

Gunakan karakter visual **calm enterprise dashboard**:

- bersih dan profesional;
- mengutamakan keterbacaan data;
- kepadatan informasi sedang;
- warna netral mendominasi;
- warna utama dipakai untuk aksi dan state aktif;
- border tipis lebih dominan daripada shadow;
- radius lembut dan konsisten;
- animasi singkat dan fungsional;
- light mode dan dark mode memiliki kualitas yang setara.

Prinsip utama:

1. Data utama harus terlihat sebelum dekorasi.
2. Satu area hanya memiliki satu fokus visual utama.
3. Hierarki dibentuk melalui ukuran, bobot, jarak, dan warna.
4. Komponen yang memiliki fungsi sama harus terlihat dan berperilaku sama.
5. Warna tidak boleh menjadi satu-satunya penyampai status.
6. Setiap halaman harus tetap dapat digunakan pada layar kecil.

## 2. Struktur aplikasi

Struktur shell desktop:

```text
+----------------------+------------------------------------------+
|                      | Header sticky                            |
| Sidebar              +------------------------------------------+
| 290 px               |                                          |
|                      | Main content                             |
| Navigation           |                                          |
|                      | 12-column responsive grid                |
|                      |                                          |
|                      |                                          |
+----------------------+------------------------------------------+
```

Struktur mobile:

```text
+------------------------------------------+
| Header: menu, logo, actions              |
+------------------------------------------+
|                                          |
| Main content: 1 column                   |
|                                          |
+------------------------------------------+

Sidebar dibuka sebagai drawer dengan overlay.
```

### 2.1 Sidebar

Spesifikasi umum:

- lebar expanded: `280–296px`;
- lebar collapsed: `80–96px`;
- posisi fixed atau sticky setinggi viewport;
- background sama dengan surface utama;
- border kanan 1px;
- scroll internal jika menu panjang;
- logo berada pada bagian atas;
- menu dikelompokkan berdasarkan fungsi;
- label grup memakai huruf kecil/kapital yang konsisten;
- item aktif memakai background tint warna utama;
- submenu memiliki indentasi yang jelas;
- item baru dapat memakai badge kecil seperti `New`.

Pada desktop, sidebar dapat diciutkan menjadi icon rail. Pada layar di bawah
breakpoint desktop besar, sidebar berubah menjadi drawer.

### 2.2 Header

Header bersifat sticky dan tetap terlihat saat konten di-scroll.

Isi yang disarankan:

- tombol buka/tutup sidebar;
- pencarian global;
- shortcut pencarian;
- tombol tema;
- notifikasi;
- avatar dan menu akun.

Spesifikasi:

- tinggi efektif sekitar `64–72px`;
- background surface;
- border bawah 1px;
- tombol icon `40–44px`;
- search field desktop sekitar `360–440px`;
- pada mobile, pencarian boleh dipindahkan ke dialog atau baris kedua.

### 2.3 Main content

- max-width konten: `1440–1536px`;
- konten berada di tengah;
- padding mobile: `16px`;
- padding tablet/desktop: `24px`;
- jarak antarblok: `16–24px`;
- gunakan grid 12 kolom pada desktop;
- gunakan satu kolom pada mobile.

Contoh pembagian dashboard:

```text
Desktop besar

+-----------------------------+-------------------+
| Metrics + primary chart     | Target/summary    |
| 7 columns                   | 5 columns         |
+-----------------------------+-------------------+
| Full-width chart/table                          |
+-------------------------------------------------+

Mobile

+------------------+
| Metric           |
+------------------+
| Metric           |
+------------------+
| Chart            |
+------------------+
| Summary          |
+------------------+
```

## 3. Breakpoint

Gunakan breakpoint berdasarkan kebutuhan konten, bukan jenis perangkat tertentu.

| Nama | Rentang umum | Perilaku |
|---|---:|---|
| Small | `< 640px` | Satu kolom, sidebar drawer |
| Medium | `640–767px` | Metric dapat menjadi dua kolom |
| Large | `768–1279px` | Grid lebih lebar, padding 24px |
| Desktop | `≥ 1280px` | Sidebar permanen, header horizontal |
| Wide | `≥ 1536px` | Konten mencapai max-width |

Aturan responsif:

- jangan hanya mengecilkan komponen desktop;
- urutkan konten berdasarkan prioritas;
- tabel boleh scroll horizontal;
- action sekunder dapat masuk overflow menu;
- modal besar berubah menjadi full-screen dialog pada mobile;
- chart harus memiliki tinggi minimum yang tetap terbaca.

## 4. Design token

Token berikut adalah sistem rekomendasi yang digeneralisasi dari karakter visual
referensi.

### 4.1 Warna utama

```css
:root {
  --color-brand-50:  #ecf3ff;
  --color-brand-100: #dde9ff;
  --color-brand-200: #c2d6ff;
  --color-brand-300: #9cb9ff;
  --color-brand-400: #7592ff;
  --color-brand-500: #465fff;
  --color-brand-600: #3641f5;
  --color-brand-700: #2f38d4;
  --color-brand-800: #252dae;
  --color-brand-950: #161950;
}
```

Penggunaan:

- `brand-500/600`: primary button, link, active navigation;
- `brand-50/100`: selected background dan highlight ringan;
- `brand-300`: focus border light mode;
- `brand-800`: focus border dark mode.

### 4.2 Warna netral

```css
:root {
  --color-gray-50:  #f9fafb;
  --color-gray-100: #f2f4f7;
  --color-gray-200: #e4e7ec;
  --color-gray-300: #d0d5dd;
  --color-gray-400: #98a2b3;
  --color-gray-500: #667085;
  --color-gray-600: #475467;
  --color-gray-700: #344054;
  --color-gray-800: #1d2939;
  --color-gray-900: #101828;
  --color-gray-950: #0c111d;
  --color-white:    #ffffff;
}
```

Pemetaan semantik light mode:

| Token semantik | Nilai |
|---|---|
| `background` | gray-50 |
| `surface` | white |
| `surface-subtle` | gray-50 |
| `border` | gray-200 |
| `border-strong` | gray-300 |
| `text-primary` | gray-800/900 |
| `text-secondary` | gray-600 |
| `text-muted` | gray-500 |
| `icon-muted` | gray-400/500 |

Pemetaan semantik dark mode:

| Token semantik | Rekomendasi |
|---|---|
| `background` | gray-950 |
| `surface` | gray-900 atau putih 3% |
| `surface-subtle` | gray-800 |
| `border` | gray-800 |
| `border-strong` | gray-700 |
| `text-primary` | putih 90% |
| `text-secondary` | gray-300/400 |
| `text-muted` | gray-400/500 |

### 4.3 Warna status

```css
:root {
  --color-success-50:  #ecfdf3;
  --color-success-500: #12b76a;
  --color-success-600: #039855;
  --color-success-700: #027a48;

  --color-warning-50:  #fffaeb;
  --color-warning-500: #f79009;
  --color-warning-600: #dc6803;
  --color-warning-700: #b54708;

  --color-error-50:  #fef3f2;
  --color-error-500: #f04438;
  --color-error-600: #d92d20;
  --color-error-700: #b42318;

  --color-info-50:  #f0f9ff;
  --color-info-500: #0ba5ec;
  --color-info-600: #0086c9;
}
```

Status harus ditampilkan menggunakan kombinasi:

- warna;
- icon;
- label teks.

Contoh: badge hijau dengan icon check dan teks `Selesai`.

## 5. Tipografi

Referensi menggunakan keluarga font **Outfit**. Untuk implementasi umum:

```css
font-family: "Outfit", "Inter", system-ui, sans-serif;
```

Jika tidak ingin memuat font eksternal, gunakan system font.

### 5.1 Skala teks aplikasi

| Peran | Ukuran | Line-height | Weight |
|---|---:|---:|---:|
| Page title | 24–30px | 32–38px | 600–700 |
| Section title | 18–20px | 28–30px | 600 |
| Card title | 16–18px | 24–28px | 600 |
| Metric value | 28–36px | 36–44px | 700 |
| Body | 14–16px | 20–24px | 400 |
| Label | 14px | 20px | 500 |
| Caption | 12px | 18px | 400–500 |
| Button | 14px | 20px | 500–600 |

Aturan:

- angka KPI memakai tabular numerals jika tersedia;
- hindari weight di bawah 400 untuk teks kecil;
- line-height body minimal 1.4;
- label input tidak boleh hanya mengandalkan placeholder;
- gunakan sentence case untuk tombol dan judul.

## 6. Spacing

Gunakan skala dasar 4px:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

Rekomendasi:

| Konteks | Spacing |
|---|---:|
| Icon dengan label | 8–12px |
| Antarfield form | 16–20px |
| Padding input | 10–12px vertikal, 12–16px horizontal |
| Padding card mobile | 20px |
| Padding card desktop | 24px |
| Antarcard | 16–24px |
| Antarsection | 24–32px |
| Page padding | 16px mobile, 24px desktop |

Hindari nilai acak seperti 13px, 19px, atau 27px kecuali untuk alignment optik.

## 7. Radius dan border

Skala radius:

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
}
```

Penggunaan:

| Komponen | Radius |
|---|---:|
| Input dan button | 8px |
| Segmented control | 8px |
| Dropdown | 12–16px |
| Card | 16px |
| Modal | 16–24px |
| Avatar/badge pill | Full |

Border standar:

```css
border: 1px solid var(--color-border);
```

Gunakan border tipis untuk memisahkan surface. Jangan memberi shadow besar pada
setiap card.

## 8. Elevation

Gunakan tiga tingkat elevasi:

```css
:root {
  --shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-md:
    0 4px 8px -2px rgba(16, 24, 40, 0.10),
    0 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg:
    0 12px 16px -4px rgba(16, 24, 40, 0.10),
    0 4px 6px -2px rgba(16, 24, 40, 0.05);
}
```

| Tingkat | Penggunaan |
|---|---|
| XS | Input aktif, segmented control |
| MD | Sticky mobile menu, popover kecil |
| LG | Dropdown, notification panel, modal |

Card dashboard biasa cukup memakai border tanpa shadow.

## 9. Icon

- ukuran navigation icon: `20–24px`;
- ukuran inline icon: `16–20px`;
- stroke/fill mengikuti warna teks;
- semua icon dalam satu set harus memiliki gaya konsisten;
- icon-only button wajib memiliki label aksesibel;
- icon dekoratif memakai `aria-hidden="true"`;
- icon bukan pengganti label untuk aksi yang tidak umum.

Container metric icon:

- ukuran `48 × 48px`;
- radius `12px`;
- background gray-100 atau tint brand;
- icon `24px`.

## 10. Card

Anatomi card:

```text
+------------------------------------------------+
| Title                              More menu   |
| Supporting text                                |
|                                                |
| Content: metric/chart/table                    |
|                                                |
| Optional footer/action                         |
+------------------------------------------------+
```

Spesifikasi:

- background surface;
- border 1px;
- radius 16px;
- padding 20px mobile, 24px desktop;
- header memakai flex;
- title dan action terpisah jelas;
- tinggi card mengikuti konten kecuali grid memerlukan alignment;
- jangan membuat seluruh card clickable jika terdapat action di dalamnya.

### 10.1 Metric card

Urutan informasi:

1. icon atau kategori;
2. label metric;
3. nilai utama;
4. perubahan relatif;
5. periode pembanding.

Contoh:

```text
Customers
3,782
↑ 11.01% vs last month
```

Perubahan positif/negatif harus mempertimbangkan konteks. Penurunan bounce rate,
misalnya, dapat menjadi hal positif.

## 11. Button

### 11.1 Variant

| Variant | Penggunaan |
|---|---|
| Primary | Aksi utama halaman |
| Secondary | Aksi penting kedua |
| Outline | Filter, download, tindakan netral |
| Ghost | Toolbar dan aksi ringan |
| Destructive | Hapus atau tindakan berisiko |

### 11.2 Ukuran

| Ukuran | Tinggi | Padding horizontal |
|---|---:|---:|
| Small | 32–36px | 12px |
| Medium | 40–44px | 16px |
| Large | 48px | 20px |

Aturan:

- maksimal satu primary action per area;
- destructive action tidak memakai brand blue;
- loading button mempertahankan lebar;
- icon leading memiliki jarak 8px;
- disabled state tetap terbaca tetapi jelas tidak aktif;
- focus ring minimal 2–3px dengan kontras memadai.

## 12. Form

Anatomi field:

```text
Label                      Optional
+----------------------------------+
| Leading icon  Input      Suffix  |
+----------------------------------+
Helper text / Error message
```

Spesifikasi input:

- tinggi `40–44px`;
- radius `8px`;
- border gray-200/300;
- padding horizontal `12–16px`;
- label 14px medium;
- placeholder lebih redup dari nilai;
- focus memakai brand border dan ring;
- error memakai border, icon, dan pesan;
- success state hanya dipakai jika benar-benar membantu;
- disabled state tidak boleh menyerupai field biasa.

State wajib:

- default;
- hover;
- focus;
- filled;
- error;
- success jika diperlukan;
- disabled;
- read-only;
- loading.

### 12.1 Form layout

- form pendek: satu kolom;
- form desktop kompleks: maksimal dua kolom;
- field yang berkaitan boleh berada dalam satu baris;
- alamat, deskripsi, dan upload memakai lebar penuh;
- action form berada di kanan desktop dan full-width/stacked pada mobile;
- error summary ditampilkan untuk form panjang.

### 12.2 Upload/dropzone

- border dashed;
- icon upload;
- instruksi singkat;
- format dan ukuran maksimum;
- tombol browse sebagai alternatif drag-and-drop;
- progress, success, error, preview, dan remove state.

## 13. Table

Anatomi:

```text
+-------------------------------------------------------+
| Title             Search  Filter  Download  Add       |
+-------------------------------------------------------+
| Header                                                |
+-------------------------------------------------------+
| Row                                                   |
| Row                                                   |
+-------------------------------------------------------+
| Showing 1–10 of 80                 Pagination         |
+-------------------------------------------------------+
```

Spesifikasi:

- header memakai background subtle atau white;
- header text 12–14px medium;
- row text 14px;
- border horizontal tipis;
- row height `52–64px`;
- action ditempatkan di kolom terakhir;
- status memakai badge;
- angka disejajarkan ke kanan;
- primary identity berada di kolom pertama;
- loading menggunakan skeleton row;
- empty state menjelaskan langkah selanjutnya.

Responsif:

- bungkus table dalam `overflow-x: auto`;
- pertahankan kolom terpenting;
- kolom sekunder boleh disembunyikan pada mobile;
- jangan mengecilkan teks di bawah 12px;
- alternatif mobile dapat berupa list card.

Fitur data table:

- search;
- jumlah item per halaman;
- filter;
- sorting;
- pagination;
- download/export;
- bulk selection jika relevan.

## 14. Badge

Jenis:

- neutral;
- brand/info;
- success;
- warning;
- error.

Spesifikasi:

- tinggi `22–28px`;
- font `12–14px`, medium;
- radius full;
- padding horizontal `8–10px`;
- background tint;
- text memakai warna status gelap;
- dapat memakai dot atau icon kecil.

Hindari badge solid sangat terang untuk status yang sering muncul di tabel.

## 15. Navigation

### 15.1 Sidebar item

- tinggi target `40–44px`;
- icon `20–24px`;
- gap `12px`;
- padding horizontal `12px`;
- radius `8px`;
- label 14px medium;
- active state memakai tint brand;
- hover memakai neutral subtle;
- caret menunjukkan submenu;
- submenu terbuka harus tetap menunjukkan parent aktif.

### 15.2 Breadcrumb

Gunakan pada halaman yang memiliki hierarki dalam:

```text
Home / Products / Edit product
```

- page title tetap diperlukan;
- item terakhir bukan link;
- breadcrumb tidak menggantikan tombol kembali untuk flow tertentu.

### 15.3 Tabs

- maksimal 4–6 tab yang terlihat;
- active state jelas melalui text, background, atau underline;
- gunakan segmented control untuk filter chart kecil;
- tabs harus dapat dinavigasi dengan keyboard.

## 16. Dropdown dan popover

- muncul dekat trigger;
- radius `12–16px`;
- border tipis;
- shadow medium/large;
- padding container 8–12px;
- item minimum tinggi 36–40px;
- destructive item dipisahkan;
- tutup dengan Escape atau click outside;
- focus berpindah dengan benar;
- pada mobile, popover kompleks boleh menjadi bottom sheet.

Panel notifikasi dapat memiliki:

- lebar desktop `340–380px`;
- tinggi maksimal dengan internal scroll;
- header tetap;
- list notification;
- footer `View all`;
- unread indicator;
- empty state.

## 17. Modal

Ukuran:

| Tipe | Lebar |
|---|---:|
| Confirmation | 400–480px |
| Form | 560–720px |
| Detail | 720–960px |

Aturan:

- overlay gelap transparan;
- title dan close button pada header;
- body dapat scroll;
- footer action tetap terlihat untuk konten panjang;
- Escape menutup jika aman;
- destructive confirmation menyebut objek secara spesifik;
- focus dikunci di dalam modal;
- focus kembali ke trigger setelah modal ditutup.

## 18. Chart dan visualisasi data

Gunakan chart hanya jika hubungan data lebih mudah dipahami secara visual.

Pemilihan chart:

| Tujuan | Chart |
|---|---|
| Tren waktu | Line/area |
| Perbandingan kategori | Bar |
| Proporsi sederhana | Donut |
| Progress terhadap target | Radial/progress |
| Lokasi | Map |

Aturan:

- satu warna utama untuk seri primer;
- seri pembanding memakai warna netral atau tint;
- jangan memakai terlalu banyak warna;
- axis dan grid line dibuat ringan;
- tooltip menampilkan nilai lengkap;
- legend dapat diklik jika membantu;
- sertakan ringkasan angka di luar chart;
- jangan hanya mengandalkan warna untuk membedakan seri;
- format angka dan mata uang harus konsisten.

Filter periode dapat memakai segmented control:

```text
12 months | 30 days | 7 days | 24 hours
```

## 19. Empty, loading, error, dan success state

Setiap komponen data wajib memiliki empat kondisi:

### Loading

- skeleton mengikuti struktur final;
- hindari layout shift;
- spinner digunakan untuk area kecil atau aksi singkat.

### Empty

- icon/illustration sederhana;
- judul menjelaskan bahwa data belum ada;
- deskripsi menjelaskan penyebab;
- action mengarahkan pengguna ke langkah berikutnya.

### Error

- pesan menjelaskan apa yang gagal;
- jangan hanya menampilkan kode teknis;
- sediakan retry jika aman;
- data lama boleh tetap terlihat dengan indikator stale.

### Success

- feedback dekat dengan aksi;
- toast untuk aksi ringan;
- success page untuk flow besar;
- jangan menampilkan toast untuk perubahan yang sudah jelas secara visual.

## 20. Authentication page

Layout auth yang disarankan:

```text
Desktop
+-------------------------+-------------------------+
| Form                    | Brand/illustration      |
| Sign in                 | Value proposition       |
|                         |                         |
+-------------------------+-------------------------+

Mobile
+-------------------------+
| Logo                    |
| Form                    |
+-------------------------+
```

Aturan:

- form memiliki lebar maksimal `400–480px`;
- social sign-in ditempatkan sebelum divider;
- password memiliki show/hide;
- `Forgot password` mudah ditemukan;
- error autentikasi tidak mengungkap apakah akun tertentu tersedia;
- halaman auth tidak memakai sidebar dashboard.

## 21. Dark mode

Dark mode bukan sekadar membalik warna.

Aturan:

- background menggunakan gray-950;
- surface menggunakan gray-900 atau white opacity 3%;
- border tetap terlihat menggunakan gray-800;
- teks utama tidak harus putih 100%;
- brand color dapat sedikit diturunkan saturasinya;
- shadow dikurangi dan border diperjelas;
- status tint memakai opacity rendah;
- chart grid dan tooltip memiliki token khusus dark mode;
- gambar/logo harus mempunyai versi yang sesuai.

Mode tema:

- light;
- dark;
- follow system.

Pilihan pengguna harus disimpan.

## 22. Motion

Durasi:

| Interaksi | Durasi |
|---|---:|
| Hover/focus | 100–150ms |
| Dropdown | 150–200ms |
| Sidebar | 200–300ms |
| Modal | 200–250ms |

Gunakan easing standar:

```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

Animasi harus:

- menjelaskan perubahan state;
- tidak menghalangi pekerjaan;
- menghormati `prefers-reduced-motion`;
- tidak menjalankan animasi dekoratif terus-menerus.

## 23. Accessibility

Target minimum:

- WCAG 2.2 AA;
- kontras teks normal minimal 4.5:1;
- kontras teks besar minimal 3:1;
- semua fungsi dapat dipakai dengan keyboard;
- focus indicator selalu terlihat;
- target sentuh minimal sekitar 44 × 44px;
- heading mengikuti urutan semantik;
- form memiliki label yang terhubung;
- error field dihubungkan dengan `aria-describedby`;
- icon-only button memiliki accessible name;
- modal memakai focus trap;
- sidebar drawer dapat ditutup dengan Escape;
- chart memiliki ringkasan atau tabel alternatif;
- status tidak hanya ditunjukkan dengan warna.

## 24. Content design

Gunakan bahasa ringkas dan langsung:

- tombol memakai kata kerja: `Tambah produk`, `Simpan`, `Unduh`;
- hindari label umum seperti `Submit`;
- destructive action menyebut objek: `Hapus invoice`;
- empty state menjelaskan langkah berikutnya;
- error menyebut masalah dan solusi;
- konsisten dalam format tanggal, angka, mata uang, dan persentase.

Contoh:

```text
Kurang baik: Something went wrong.
Lebih baik: Data pesanan gagal dimuat. Periksa koneksi lalu coba lagi.
```

## 25. Template halaman

### 25.1 Dashboard

```text
Page header
├── Title
├── Date/filter
└── Primary action opsional

Metric grid
Primary visualization
Secondary insights
Recent activity/table
```

### 25.2 List

```text
Page header + Add action
Search/filter toolbar
Table/list
Pagination
```

### 25.3 Detail

```text
Breadcrumb
Title + status + actions
Summary card
Tabbed detail
Activity/history
```

### 25.4 Create/edit form

```text
Breadcrumb
Title + description
Grouped form sections
Sticky or visible action footer
```

### 25.5 Settings

```text
Settings navigation
Section title
Form/content
Save action
```

## 26. Component inventory

Komponen minimum:

- App shell;
- Sidebar;
- Header;
- Global search;
- User menu;
- Notification panel;
- Breadcrumb;
- Page header;
- Card;
- Metric card;
- Button;
- Icon button;
- Badge;
- Input;
- Select;
- Textarea;
- Checkbox;
- Radio;
- Switch;
- Date picker;
- File upload;
- Table;
- Pagination;
- Tabs;
- Dropdown;
- Tooltip;
- Popover;
- Modal;
- Alert;
- Toast;
- Skeleton;
- Empty state;
- Error state;
- Chart wrapper.

Setiap komponen harus mendokumentasikan:

- anatomy;
- variant;
- size;
- state;
- responsive behavior;
- keyboard behavior;
- accessibility;
- contoh penggunaan yang benar dan salah.

## 27. Implementation-neutral token example

```css
:root {
  color-scheme: light;

  --background: #f9fafb;
  --surface: #ffffff;
  --surface-subtle: #f2f4f7;
  --border: #e4e7ec;
  --border-strong: #d0d5dd;

  --text-primary: #1d2939;
  --text-secondary: #475467;
  --text-muted: #667085;

  --primary: #465fff;
  --primary-hover: #3641f5;
  --primary-subtle: #ecf3ff;

  --success: #039855;
  --warning: #dc6803;
  --error: #d92d20;

  --radius-control: 8px;
  --radius-card: 16px;
  --page-padding: 24px;
  --content-gap: 24px;
}

[data-theme="dark"] {
  color-scheme: dark;

  --background: #0c111d;
  --surface: #101828;
  --surface-subtle: #1d2939;
  --border: #1d2939;
  --border-strong: #344054;

  --text-primary: rgba(255, 255, 255, 0.90);
  --text-secondary: #d0d5dd;
  --text-muted: #98a2b3;
}

@media (max-width: 767px) {
  :root {
    --page-padding: 16px;
    --content-gap: 16px;
  }
}
```

## 28. Do and don't

### Do

- tampilkan KPI terpenting lebih dahulu;
- gunakan whitespace untuk mengelompokkan informasi;
- gunakan tag commit/status yang dapat dipahami;
- sediakan state loading, empty, error, dan success;
- buat filter dekat dengan data yang dipengaruhi;
- pertahankan konsistensi icon dan radius;
- uji dark mode dan mobile sejak awal.

### Don't

- memenuhi semua card dengan warna kuat;
- memakai shadow besar pada setiap surface;
- membuat satu halaman berisi terlalu banyak primary button;
- menyembunyikan label input dalam placeholder;
- memakai tabel desktop yang dipaksa mengecil di mobile;
- mengandalkan warna saja untuk status;
- menampilkan chart tanpa judul, periode, atau satuan;
- membuat sidebar panjang tanpa grouping.

## 29. Acceptance criteria

Sebuah dashboard dianggap sesuai panduan jika:

- [ ] App shell memiliki sidebar, header, dan main content yang jelas.
- [ ] Sidebar berubah menjadi drawer pada layar kecil.
- [ ] Konten memakai grid responsif dan padding konsisten.
- [ ] Semua warna berasal dari token semantik.
- [ ] Card memakai border/radius yang konsisten.
- [ ] Form memiliki label dan seluruh state penting.
- [ ] Table dapat digunakan pada mobile.
- [ ] Komponen data memiliki loading, empty, dan error state.
- [ ] Semua action dapat digunakan dengan keyboard.
- [ ] Focus indicator terlihat.
- [ ] Light mode dan dark mode telah diuji.
- [ ] Kontras memenuhi target WCAG AA.
- [ ] Chart memiliki alternatif atau ringkasan tekstual.
- [ ] Tidak ada lebih dari satu primary action dalam satu konteks.
- [ ] Motion menghormati `prefers-reduced-motion`.

## 30. Sumber analisis

Ditinjau pada 27 Juli 2026:

- [TailAdmin eCommerce Dashboard](https://demo.tailadmin.com/)
- [TailAdmin Analytics Dashboard](https://demo.tailadmin.com/analytics)
- [TailAdmin Form Elements](https://demo.tailadmin.com/form-elements)
- [TailAdmin Data Tables](https://demo.tailadmin.com/data-tables)
- [TailAdmin Cards](https://demo.tailadmin.com/cards)
- [TailAdmin Sign In](https://demo.tailadmin.com/signin)

Nilai token tertentu, seperti font Outfit, warna brand, warna status, radius, sidebar
sekitar 290px, grid 12 kolom, dan breakpoint lebar 1536px, diperoleh dari
stylesheet dan struktur HTML publik demo. Rekomendasi lain merupakan generalisasi
untuk membentuk sistem desain yang lebih reusable dan implementation-neutral.
