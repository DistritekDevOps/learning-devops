# Image dasar: Node.js varian alpine
FROM node:22-alpine

WORKDIR /app

# Salin file dependensi dulu (memanfaatkan layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Salin kode aplikasi
COPY server.js ./

# Jalankan sebagai user non-root
USER node

EXPOSE 3000

CMD ["node", "server.js"]
