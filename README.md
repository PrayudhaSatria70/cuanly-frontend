# Cuanly — Modern Financial Management & Money Tracking Platform

Cuanly adalah aplikasi pencatat keuangan modern yang membantu pengguna memantau pemasukan dan pengeluaran, mengatur budget, mencegah overspending, serta memindai struk belanja secara otomatis (Smart OCR).

---

## 🚀 Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS & Glassmorphism
- **Language:** TypeScript
- **Icons:** Lucide React
- **Internationalization:** Bilingual (Bahasa Indonesia & English)
- **Data Layer:** LocalStorage Reactive Engine (Frontend-first architecture, siap integrasi REST API backend)

---

## 🌟 Fitur Utama

### 1. User (Pengguna)
- **Beranda / Home:** Total saldo, mutasi arus kas (Cashflow Chart), grafik donat 6 kategori pengeluaran (Hick's Law), banner peringatan batas budget, dan transaksi terbaru.
- **Transaksi:** Riwayat mutasi lengkap, filter tipe (Semua, Pengeluaran, Pemasukan), filter kategori, pencarian, dan rute dinamis `/transaksi/[id]`.
- **Tambah Pengeluaran / Transaksi:** Form pencatatan terfokus dengan nominal format rupiah dan tombol aksi bawah lebar (Fitts's Law).
- **Smart Receipt Scanner:** Foto / unggah struk belanja dengan simulasi OCR otomatis yang mendeteksi nama toko, total belanja, dan daftar item belanja.
- **Budgeting:** Pengaturan batas pengeluaran bulanan per kategori dengan progress bar threshold (<70% Hijau, 70-90% Kuning, >90% Merah), serta rute dinamis `/budget/[slug]`.
- **Profil:** Alih bahasa instan (ID / EN), preferensi notifikasi, ekspor data transaksi ke CSV, dan 1-klik akun demo.

### 2. Admin Backoffice
- **Dashboard Statistik:** Ringkasan metrik volume transaksi platform, total pengguna aktif, mitra bisnis, dan antrean keluhan.
- **Kelola User & Mitra:** Direktori pengguna terdaftar dan mitra bisnis beserta rute dinamis `/admin/users/[id]`.
- **Verifikasi Mitra:** Antrean verifikasi berkas legalitas mitra (NIB/SIUP) dengan alur Setujui / Tolak dan rute dinamis `/admin/verification/[id]`.
- **Pantau Transaksi:** Audit log transaksi platform real-time.
- **Kelola Kategori:** Pengelolaan kategori pengeluaran dan layanan mitra.
- **Tangani Keluhan:** Penanganan tiket keluhan pelanggan dengan rute dinamis `/admin/complaints/[id]`.

---

## 🔑 Akun Demo (1-Click Instant Login)

- **Demo User:** `user@cuanly.com` / PIN: `123456`
- **Demo Admin:** `admin@cuanly.com` / PIN: `999999`

---

## 🛠️ Menjalankan Proyek

```bash
# Menjalankan development server
npm run dev

# Menjalankan production build
npm run build

# Menjalankan production server
npm run start
```
