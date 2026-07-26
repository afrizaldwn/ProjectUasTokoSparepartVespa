# Toko Sparepart Vespa (Vue 3 + MockAPI + Server Lokal)

## Arsitektur data (PENTING — sudah berubah)
Project ini sekarang memakai **2 sumber data**:

| Data | Sumber | Keterangan |
|---|---|---|
| **Login & Register** (akun admin/user) | **MockAPI** (`resource: users`) | Tidak berubah, tetap online |
| **Sparepart, Kategori, Booking Service, Audit Trail (logs)** | **Server lokal** (folder `../server`) | Disimpan sebagai file JSON di `server/data/*.json` |
| **Gambar sparepart yang diupload** | **Server lokal** | Disimpan fisik ke folder `public/img/` |

Kenapa dipisah? Karena upload gambar & penyimpanan file JSON butuh sesuatu yang bisa **menulis ke disk**, sesuatu yang tidak bisa dilakukan browser murni ke MockAPI. Jadi dibuat server kecil (Express) di folder `server/` khusus untuk itu.

## Langkah-langkah setup

### 1. Setup MockAPI (khusus akun login/register)
1. Buka https://mockapi.io dan login/daftar.
2. Buat **Project** baru, misal nama "vespa-store".
3. Catat **Base URL**, bentuknya seperti:
   `https://64xxxxxxxxxxxxxxxxxxxxxx.mockapi.io/api/v1`
4. Tambahkan **hanya 1 resource**:
   - **users** — `nama`, `username`, `email`, `password`, `role` ("admin" atau "user"), `status` ("aktif" atau "nonaktif")
5. Tambahkan minimal 1 user dengan `role: "admin"`, `status: "aktif"` secara manual di MockAPI agar bisa login sebagai admin.
6. Buka `src/services/api.js`, ganti baris:
   ```js
   const MOCKAPI_BASE_URL = 'https://REPLACE_WITH_YOUR_PROJECT_ID.mockapi.io/api/v1'
   ```

### 2. Jalankan server lokal (untuk konten + upload gambar)
```bash
cd server
npm install
npm start
```
Server berjalan di `http://localhost:5000`. Biarkan terminal ini tetap terbuka.

Data konten (sparepart, kategori, service, logs) tersimpan sebagai file JSON di `server/data/`. Gambar yang diupload admin akan otomatis disimpan ke `vespa-parts-store/public/img/`.

### 3. Jalankan frontend (Vue + Vite)
Di terminal terpisah:
```bash
cd vespa-parts-store
npm install
npm run dev
```
Buka `http://localhost:5173`

> Frontend dan server lokal harus berjalan **bersamaan** saat development.

## Struktur folder
```
vespa-parts-store/           # frontend Vue + Vite
├─ public/img/                # tempat gambar sparepart hasil upload disimpan
├─ src/
│  ├─ services/
│  │  ├─ api.js               # 2 instance axios: apiMock (MockAPI) & apiLocal (server lokal)
│  │  ├─ authService.js       # login/register -> apiMock (MockAPI)
│  │  ├─ userService.js       # kelola pengguna -> apiMock (MockAPI)
│  │  ├─ sparepartService.js  # CRUD sparepart -> apiLocal (server lokal)
│  │  ├─ kategoriService.js   # CRUD kategori -> apiLocal
│  │  ├─ bookingService.js    # CRUD booking service -> apiLocal
│  │  ├─ logService.js        # audit trail -> apiLocal
│  │  └─ uploadService.js     # upload file gambar -> apiLocal (/upload)
│  ├─ store/auth.js
│  ├─ router/index.js
│  ├─ views/user/ , views/admin/
│  └─ components/
server/                       # backend lokal (Express) — BARU
├─ server.js                  # endpoint CRUD JSON + endpoint upload gambar
├─ package.json
└─ data/
   ├─ sparepart.json
   ├─ kategori.json
   ├─ service.json
   ├─ logs.json
   └─ transaksi.json          # riwayat checkout (Laporan Transaksi)
```

## Fitur Booking Service (BARU)
- Link **"Booking Service"** di navbar (kalau belum login, otomatis diarahkan ke halaman login dulu — sama seperti keranjang).
- Halaman **`/booking-service`** — user isi jenis Vespa, no. HP, tanggal service, dan keluhan, lalu klik "Kirim Booking" (ada simulasi proses singkat, sama seperti checkout).
- Setelah dikirim, booking otomatis tersimpan ke `server/data/service.json` dengan status awal **"menunggu"**, dan langsung tercatat di Audit Trail.
- Di bawah form ada **"Riwayat Booking Saya"** — daftar booking milik user yang sedang login beserta statusnya.
- Admin bisa melihat & mengelola semua booking (dari user maupun input manual admin) di **Admin → Booking Service** (`/admin/booking-service`) — termasuk mengubah status (menunggu/proses/selesai/batal) dan mengisi biaya service.
- Tombol **"+ Keranjang"** di kartu produk & **"Tambah ke Keranjang"** di halaman detail — kalau belum login, otomatis diarahkan ke halaman login dulu.
- Ikon **keranjang di navbar** menampilkan badge jumlah item, mirip Shopee. Data keranjang tersimpan per akun (localStorage), jadi tetap ada walau browser ditutup.
- Halaman **`/keranjang`** — ubah jumlah, hapus item, lihat total, lanjut ke checkout.
- Halaman **`/checkout`** — isi alamat, pilih metode pembayaran (Transfer Bank / E-Wallet / COD, semuanya **simulasi**, tidak ada payment gateway asli), klik "Bayar Sekarang".
- Setelah bayar, transaksi otomatis tersimpan ke `server/data/transaksi.json` dan keranjang otomatis dikosongkan.
- Admin bisa melihat semua transaksi di **Admin → Laporan Transaksi** (`/admin/transaksi`), termasuk detail item yang dibeli, total pendapatan, dan bisa mengubah status transaksi (lunas/diproses/dikirim/selesai/batal).

## Fitur yang sudah tersedia
- ✅ Tema dark (jingga khas Vespa + teal vintage)
- ✅ Login & Register user (MockAPI resource `users`)
- ✅ Login khusus admin (cek `role === 'admin'`)
- ✅ CRUD penuh **Sparepart**, **Kategori**, **Booking Service** — tersimpan di JSON lokal
- ✅ **Upload gambar sparepart** — file disimpan fisik ke folder `public/img`, bukan lagi URL
- ✅ **Kelola Pengguna** (khusus admin, MockAPI)
- ✅ **Profil Saya** — ubah data diri & ganti password
- ✅ **Audit Trail** — pencatatan otomatis setiap create/update/delete, tersimpan di `server/data/logs.json`
- ✅ Route guard admin/user

## Pengembangan lanjutan yang disarankan
- Deploy server lokal ke hosting Node (Railway/Render) kalau ingin diakses publik, bukan cuma `localhost`
- Tambah keranjang belanja & checkout
- Hash password (baik di MockAPI maupun server lokal — saat ini masih plain text, hanya untuk demo)
- Validasi tipe & ukuran file saat upload gambar
