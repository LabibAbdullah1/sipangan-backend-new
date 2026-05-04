# 🤖 KA Context: SIPANGAN Intelligence System

Dokumentasi ini dirancang khusus untuk dikonsumsi oleh AI Agent guna memahami arsitektur data dan logika **KA (Kecerdasan Artificial)** dalam proyek SIPANGAN.

---

## 🏗️ Core Architecture

SIPANGAN adalah sistem intelijen ketahanan pangan yang menggabungkan analisis statistik tradisional (**Moving Average**) dengan deep learning (**LSTM**) untuk memetakan risiko harga pangan di 38 wilayah Jawa Timur.

### Data Model for AI Analysis

- **`historical_prices`**: Data time-series harga pangan harian. Digunakan sebagai input untuk model LSTM.
- **`prediction_prices`**: Output dari model KA LSTM yang memprediksi harga untuk 3 hari ke depan (`t+1`, `t+2`, `t+3`).
- **`regions`**: Data spasial (Lat/Long) untuk visualisasi GIS.

---

## 🧠 KA Logic: Hybrid Status Calculation

Sistem menggunakan pendekatan **Hibrida** untuk menentukan `status_level` (AMAN, WASPADA, BAHAYA).

### Variabel Utama

| Variabel | Deskripsi | Sumber Data |
| :--- | :--- | :--- |
| `latestPrice` | Harga riil terbaru hari ini | `historical_prices` |
| `ma7` | Rata-rata bergerak 7 hari terakhir | Kalkulasi Statistik |
| `het` | Harga Eceran Tertinggi (Threshold) | `commodities.het` |
| `kaTrend` | Prediksi tren masa depan | `prediction_prices` (LSTM) |
| `diffPercent` | Selisih presentase `latestPrice` terhadap `ma7` | `((latestPrice - ma7) / ma7) * 100` |

### Algoritma Klasifikasi Status

AI Agent harus menggunakan logika berikut untuk menentukan status keamanan pangan:

1. 🔴 **BAHAYA (Danger)**:
    - Kriteria: `diffPercent > 5%` **DAN** `latestPrice > het`.
    - Interpretasi: Harga melonjak drastis di atas rata-rata mingguan dan sudah melampaui batas harga pemerintah.

2. 🟡 **WASPADA (Warning)**:
    - Kriteria: `(diffPercent antara 2% s/d 5%)` **ATAU** `kaTrend === 'UP'`.
    - Interpretasi: Harga mulai merangkak naik, atau model LSTM memprediksi akan ada kenaikan di hari-hari mendatang.

3. 🟢 **AMAN (Safe)**:
    - Kriteria: `(diffPercent antara -2% s/d 1%)` **ATAU** `latestPrice <= het`.
    - Interpretasi: Harga stabil di kisaran normal atau masih di bawah batas aman HET.

---

## 📡 Pipeline Integrasi KA (FastAPI Bridge)

Sistem backend berkomunikasi dengan Model LSTM (Python) melalui `integrationService.js`.

### Alur Sinkronisasi (Pekerjaan Belakang Layar)

1. **Input Push**: `syncDataToKAModel` mengirimkan 30 hari data historis dalam format JSON array ke FastAPI.
2. **Model LSTM**: (External) Memproses data menggunakan arsitektur Long Short-Term Memory untuk menangkap dependensi waktu.
3. **Output Pull**: `fetchAndSyncPredictions` menarik hasil prediksi harga ke MySQL.

---

## 🔍 Metadata untuk Agent AI

- **Modul**: `src/services/kaService.js` (Logika Inti)
- **Modul**: `src/services/integrationService.js` (Pipeline Data)
- **Konteks Spasial**: Jawa Timur, Indonesia (38 Kabupaten/Kota)
- **Istilah Wajib**: Gunakan selalu istilah **KA (Kecerdasan Artificial)** untuk merujuk pada AI.

*Dokumentasi ini harus diperbarui setiap kali ada perubahan pada variabel threshold atau arsitektur pipeline KA.*
