# Menggunakan image resmi Node.js versi 22 berbasis Alpine Linux.
# Alpine dipilih karena ukuran image lebih kecil sehingga proses build
# dan distribusi container menjadi lebih cepat.
FROM node:22-alpine

# Menentukan direktori kerja di dalam container.
# Semua perintah berikutnya (COPY, RUN, CMD) akan dijalankan dari folder /app.
# Jika folder belum ada, Docker akan membuatnya secara otomatis.
WORKDIR /app

# Menyalin file package.json ke dalam folder /app.
# File ini disalin lebih dulu agar Docker dapat memanfaatkan layer cache.
# Jika package.json tidak berubah, proses instalasi dependency tidak perlu
# dijalankan ulang pada build berikutnya.
# Karena aplikasi ini tidak memiliki dependency eksternal,
# tidak diperlukan perintah RUN npm install atau npm ci.
COPY package.json ./

# Menyalin file server.js dari komputer host ke dalam folder /app
# di dalam container. File ini berisi kode utama aplikasi.
COPY server.js ./

# Menjalankan aplikasi menggunakan user "node" yang sudah tersedia
# pada image resmi Node.js. Menjalankan container sebagai non-root
# merupakan praktik keamanan yang lebih baik dibanding menggunakan root.
USER node

# Memberikan informasi bahwa aplikasi berjalan pada port 3000.
# Perintah ini hanya sebagai dokumentasi dan tidak otomatis
# membuka port ke komputer host.
EXPOSE 3000

# Menentukan perintah yang dijalankan saat container mulai berjalan.
# Docker akan mengeksekusi perintah:
# node server.js
CMD ["node", "server.js"]