# Dokumentasi API SIPANGAN 🌾

SIPANGAN (Sistem Intelijen Ketahanan Pangan) adalah platform berbasis GIS untuk memantau status ketahanan pangan (beras) di 38 wilayah Jawa Timur menggunakan integrasi data historis dan prediksi **KA (Kecerdasan Artificial)**.

**Base URL**: `http://localhost:3000/api/v1`

---

## 🔐 Otentikasi (Admin)

Beberapa endpoint memerlukan otentikasi admin. Gunakan Bearer Token yang didapat dari login.

| Header | Value |
| :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` |

### Login Admin

`POST /auth/login`

**Request Body:**

```json
{
  "username": "admin",
  "password": "password123"
}
```

---

## 🗺️ Endpoint Publik (GIS & Tren)

### 1. Get Map Status

Mengambil status warna pemetaan untuk semua wilayah (dioptimalkan dengan Redis).
`GET /map-status?commodity_id=1`

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "region_id": 1,
      "region_name": "Kabupaten Bangkalan",
      "latest_price": 11500,
      "status_level": "WASPADA"
    },
    ...
  ]
}
```

### 2. Get Region Trend

Mengambil data historis 7 hari dan prediksi KA 3 hari ke depan untuk grafik.
`GET /regions/:regionId/trend?commodity_id=1`

**Response Example:**

```json
{
  "success": true,
  "data": {
    "region_id": "1",
    "commodity_id": "1",
    "historical": [
      { "date": "2026-04-25", "price": 10500 },
      ...
    ],
    "ka_predictions": [
      { "date": "2026-05-03", "price": 11650 },
      ...
    ]
  }
}
```

---

## 🛠️ Endpoint Admin (Protected)

### 1. Bulk Upload Prices (Historis)

Singkronisasi massal data harga aktual.
`POST /admin/prices/bulk`

**Request Body:**

```json
{
  "prices": [
    { "region_id": 1, "commodity_id": 1, "price_date": "2026-05-02", "price": 11500 },
    ...
  ]
}
```

### 2. Bulk Upload Predictions (KA)

Singkronisasi massal data output model KA LSTM.
`POST /admin/predictions/bulk`

**Request Body:**

```json
{
  "predictions": [
    { "region_id": 1, "commodity_id": 1, "target_date": "2026-05-03", "predicted_price": 11600 },
    ...
  ]
}
```

### 3. Region Management (CRUD)

- `POST /admin/regions`: Tambah wilayah baru.
- `PUT /admin/regions/:id`: Update koordinat atau nama wilayah.
- `DELETE /admin/regions/:id`: Hapus wilayah.

---

## 📊 Status Level Logic

Penentuan warna pemetaan dilakukan setiap tengah malam melalui Cron Job dengan logika **Hibrida KA**:

- 🟢 **AMAN**: Harga stabil (-2% s/d +1% dari MA) ATAU di bawah HET.
- 🟡 **WASPADA**: Harga naik 2%-5% dari MA, ATAU tren KA memprediksi kenaikan 3 hari ke depan.
- 🔴 **BAHAYA**: Harga melonjak >5% dari MA DAN harga aktual > HET.
