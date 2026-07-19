# ---- Stage 1: build aplikasi React ----
FROM node:22-alpine AS builder
WORKDIR /app

# Salin file dependensi dulu (memanfaatkan layer cache)
COPY package*.json ./
RUN npm ci

# Salin sisa kode lalu build ke folder dist/
COPY . .
RUN npm run build

# ---- Stage 2: image akhir yang ramping ----
FROM nginx:alpine

# Konfigurasi Nginx dengan fallback untuk client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build saja — Node.js dan node_modules tidak ikut
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
