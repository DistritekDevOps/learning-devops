# ---- Stage 1: Build aplikasi React ----
# Tahap pertama digunakan untuk membangun (build) aplikasi React.
# Hasil akhirnya berupa file HTML, CSS, dan JavaScript statis
# yang nantinya akan dijalankan oleh web server.
FROM node:22-alpine AS builder

# Menentukan direktori kerja di dalam container.
# Semua proses build akan dilakukan di folder /app.
WORKDIR /app

# Menyalin file package.json dan package-lock.json terlebih dahulu.
# Langkah ini memanfaatkan layer cache Docker sehingga dependency
# tidak perlu diinstal ulang jika kedua file tersebut tidak berubah.
COPY package*.json ./

# Menginstal seluruh dependency yang dibutuhkan untuk proses build.
# npm ci digunakan karena lebih cepat, konsisten, dan cocok
# untuk proses build maupun CI/CD.
RUN npm ci

# Menyalin seluruh source code aplikasi ke dalam container.
COPY . .

# Menjalankan proses build React.
# Hasil build akan disimpan pada folder /app/dist.
RUN npm run build

# ---- Stage 2: Image akhir yang lebih ringan ----
# Tahap kedua membuat image yang hanya berisi hasil build.
# Node.js tidak lagi dibutuhkan karena aplikasi React sudah
# diubah menjadi file statis.
FROM nginx:alpine

# Menyalin konfigurasi Nginx.
# Konfigurasi ini mengatur cara Nginx melayani file aplikasi,
# termasuk fallback ke index.html agar client-side routing
# (misalnya React Router) tetap berfungsi saat halaman di-refresh.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Menyalin hasil build dari stage "builder" ke folder web Nginx.
# Hanya folder dist yang disalin sehingga source code,
# dependency, dan Node.js tidak ikut masuk ke image akhir.
COPY --from=builder /app/dist /usr/share/nginx/html

# Memberikan informasi bahwa Nginx melayani aplikasi
# melalui port 80 di dalam container.
EXPOSE 80