# SIPANGAN Backend 🌾

Platform Intelijen Ketahanan Pangan Berbasis GIS Jawa Timur.

## Fitur Utama

- **High Performance**: Respon peta sub-50ms menggunakan Redis.
- **KA-Powered**: Analisis tren menggunakan model Kecerdasan Artificial.
- **Admin Panel**: CRUD wilayah dan sinkronisasi data bulk.
- **Unit Tested**: Testing komprehensif menggunakan Jest & Supertest.

## Teknologi

- Node.js (ESM Mode)
- Express.js
- MySQL
- Redis
- node-cron

## Dokumentasi Lengkap

Silakan baca [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk detail endpoint dan cara penggunaan.

## Cara Instalasi

1. Clone repository.
2. Install dependencies: `npm install`.
3. Konfigurasi `.env` (MySQL & Redis).
4. Migrasi Database: `src/db/schema.sql`.
5. Seed Data: `npm run seed` (tambahkan script ke package.json).
6. Jalankan Server: `npm start`.
