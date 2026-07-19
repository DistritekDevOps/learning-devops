# Image dasar: Node.js varian alpine (kecil)
FROM node:22-alpine

# Direktori kerja di dalam container
WORKDIR /app

# Salin file dependensi dulu (memanfaatkan layer cache).
# Aplikasi ini tanpa dependensi eksternal, jadi tidak perlu npm install —
# untuk aplikasi dengan dependensi, tambahkan: RUN npm ci --omit=dev
COPY package.json ./

# Salin kode aplikasi
COPY server.js ./

# Jalankan sebagai user non-root (best practice keamanan)
USER node

# Dokumentasi: aplikasi melayani di port 3000
EXPOSE 3000

# Perintah saat container dijalankan
CMD ["node", "server.js"]
