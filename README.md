<<<<<<< HEAD
# Aplikasi Manajemen Pelanggan & Tiket Gangguan (Next.js)

Versi **Next.js 14 (App Router) full-stack** — satu framework untuk backend + frontend, ditulis penuh dalam JavaScript. Ini adalah rewrite dari versi Laravel sebelumnya, dengan **struktur database & alur kerja yang identik** (skema tabel sama, integrasi n8n sama).

**Stack:** Next.js 14 · Prisma ORM · MySQL · NextAuth v4 · Tailwind CSS (semua JavaScript murni, tanpa TypeScript)

> ⚠️ **Kalau Anda update dari versi sebelumnya**: ada kolom baru `noc` di tabel `tickets` (dulu CC & NOC berbagi satu kolom, sekarang dipisah). Jalankan `npx prisma generate && npx prisma db push` (atau versi Docker: `docker compose exec app npx prisma db push`) setelah menimpa file project dengan versi ini, sebelum menjalankan aplikasinya.

## Fitur

- 👤 **Data Pelanggan** — tambah, ubah, hapus, **live search** (filter otomatis saat mengetik, tanpa klik tombol)
- 🎫 **Tiket Gangguan** — buat tiket baru (pilih Site dulu → **cari pelanggan via live search** yang otomatis terfilter per site, bukan dropdown biasa), assign **lebih dari satu teknisi sekaligus** (atau pilih semua), live search di daftar tiket
- 📝 **CC (Customer Service) & NOC — dua field terpisah** — CC diisi saat tiket dibuat, NOC diisi terpisah saat tiket ditutup. Notifikasi Telegram: baris CC selalu tampil, baris NOC **hanya muncul di notifikasi closed**
- 📈 **Laporan & Analisis** — 4 laporan siap pakai, semua bisa diklik untuk lihat detail (bukan cuma angka statis):
  1. Rekap & klasifikasi keluhan (LOS, Lemot, Putus-putus, Billing, dll) + area prioritas
  2. Analisis penyebab gangguan terbanyak per area (mingguan, bisa geser minggu)
  3. Monitoring SLA — rata-rata respon/resolusi, daftar tiket overdue, % compliance
  4. Laporan bulanan (pilih bulan/tahun) — total tiket, jenis gangguan, area terbanyak, SLA, ada tombol Cetak
- 📍 **Site / Lokasi** & 🔧 **Teknisi** — CRUD via modal
- ⏱️ **Kebijakan SLA**
- 📊 **Dashboard** statistik
- ⚙️ **Halaman Pengaturan** — isi kredensial n8n Webhook & Telegram Bot langsung dari web, tersimpan di database (bukan di `.env`/kode), bisa diganti kapan saja tanpa restart aplikasi
- 🔗 **Integrasi n8n & Telegram** — event tiket (dibuat/di-assign/ditutup) dikirim ke integrasi yang aktif, plus **workflow n8n siap pakai** (`tara-workflow-tiket.json`) yang meneruskan notifikasi ke Telegram dengan format lengkap + reminder tiket overdue otomatis
- 📱 **Responsif** — sidebar jadi drawer di mobile dengan hamburger di header (bukan floating), konten selalu center dengan max-width rapi di desktop lebar
- 🎨 **Dashboard didesain ulang** — kartu statistik dengan mini sparkline, chart tren tiket 7 hari, donut status tiket, progress bar kinerja, bell notifikasi fungsional (jumlah tiket urgent/belum-assign), dan 3 kolom aktivitas terbaru — warna tetap memakai palet brand yang sama, cuma layout & strukturnya yang diperbarui
- 🍬 **Konfirmasi & notifikasi pakai SweetAlert2** — tombol hapus & pesan sukses/error tidak lagi pakai `confirm()`/banner statis browser, sekarang pakai modal & toast yang lebih modern

---

## 1. Persyaratan

- Node.js **18.18** atau lebih baru (disarankan 20.x)
- MySQL / MariaDB
- npm (sudah include di Node.js)

---

## 2. Instalasi (Tanpa Docker)

```bash
# 1. Install dependency
npm install

# 2. Copy file environment
cp .env.example .env
```

Edit `.env`, isi koneksi database Anda:

```env
DATABASE_URL="mysql://root:password_anda@127.0.0.1:3306/tiket_pelanggan"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="hasil-generate-di-bawah"
```

Generate `NEXTAUTH_SECRET` (wajib diisi, dipakai untuk enkripsi session login):

```bash
openssl rand -base64 32
```

Buat database kosong:

```sql
CREATE DATABASE tiket_pelanggan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Sinkronkan skema tabel ke database

```bash
npx prisma generate
npx prisma db push
```

`db push` akan membuat semua tabel (`users`, `sites`, `pelanggan`, `teknisi`, `sla_policies`, `tickets`, `ticket_reminder_logs`, `ticket_check_logs`, `activity_logs`) sesuai `prisma/schema.prisma` — strukturnya sudah disamakan 1:1 dengan dump SQL asli Anda.

### 4. Import data lama

```bash
mysql -u root -p tiket_pelanggan < database/imports/data.sql
```

> Sama seperti versi Laravel: file ini sudah diurutkan (`sites` → `sla_policies` → `teknisi` → `pelanggan` → `tickets` → `ticket_reminder_logs` → `activity_logs`) supaya tidak kena error foreign key.

### 5. Buat akun admin

```bash
npm run db:seed
```

Login default: **admin@example.com** / **password**

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka **http://localhost:3000**

Untuk mode production (build dulu):
```bash
npm run build
npm run start
```

---

## 🐳 Instalasi via Docker

Container di sini **tidak pakai entrypoint script** — cuma jalan `npm run start` langsung. Setup awal (bikin tabel, import data lama, buat akun admin) dilakukan manual lewat `docker compose exec`, sekali saja saat pertama kali setup.

### Langkah 1 — Siapkan env untuk docker-compose

Buat file `.env` di root folder project (dibaca oleh `docker-compose.yml` untuk substitusi variabel):

```bash
cat > .env << 'EOF'
NEXTAUTH_SECRET=hasil_openssl_rand_base64_32
EOF
```

Generate `NEXTAUTH_SECRET` dengan: `openssl rand -base64 32`

> Kredensial n8n & Telegram **tidak** perlu diisi di sini — nanti diatur lewat halaman **Pengaturan** di web setelah aplikasi jalan (lihat bagian "⚙️ Konfigurasi Integrasi" di bawah).

### Langkah 2 — Build & jalankan container

```bash
docker compose up -d --build
```

Tunggu sampai semua container status `Up` / `healthy`:

```bash
docker compose ps
```

### Langkah 3 — Setup database (sekali saja, manual)

```bash
# a. Buat semua tabel sesuai schema.prisma
docker compose exec app npx prisma db push

# b. Import data lama dari dump SQL Anda
docker compose exec app sh -c "mysql -h db -u tiket_user -ptiket_pass tiket_pelanggan < database/imports/data.sql"

# c. Buat akun admin default
docker compose exec app node prisma/seed.js
```

Kalau salah satu perintah di atas error, jalankan satu-satu dan baca pesan errornya — jauh lebih gampang di-debug dibanding lewat script otomatis.

### Langkah 4 — Buka aplikasi

| Layanan | URL |
|---|---|
| Aplikasi web | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 (server: `db`, user: `root`, password: `root_pass`) |

Login: **admin@example.com** / **password**

> Kalau nanti container di-`down` lalu `up` lagi (bukan `down -v`), data MySQL tetap ada (disimpan di volume `tiket_dbdata`) — jadi Langkah 3 **tidak perlu diulang**, cukup `docker compose up -d` saja.

### Perintah Docker yang sering dipakai

```bash
docker compose ps                                # status container
docker compose logs -f app                       # log real-time
docker compose exec app sh                       # masuk ke terminal container
docker compose exec app npx prisma studio         # buka Prisma Studio (GUI database)
docker compose restart app                        # restart setelah ubah env
docker compose down                                # matikan semua (data tetap ada)
docker compose down -v                             # matikan + hapus volume (reset total, data hilang)
docker compose up -d --build                       # build ulang setelah ubah kode/Dockerfile
```

---

## ⚙️ Konfigurasi Integrasi (n8n & Telegram) — Lewat Halaman Web

Kredensial integrasi **tidak lagi diisi di `.env`**. Setelah login, buka menu **Pengaturan** (`/settings`) di sidebar, lalu isi:

1. **Webhook n8n** — URL webhook trigger dari workflow n8n Anda. Kosongkan kalau tidak dipakai.
2. **Telegram Bot Token & Chat ID** (opsional) — kalau diisi, notifikasi juga dikirim **langsung** ke Telegram tanpa lewat n8n. Bisa isi salah satu integrasi saja, atau keduanya sekaligus.

Klik **Simpan Pengaturan** — langsung aktif, tidak perlu restart aplikasi/container.

**Cara dapat Telegram Bot Token & Chat ID:**
- Bot Token: chat ke **@BotFather** di Telegram, buat bot baru, copy token yang diberikan
- Chat ID grup: tambahkan bot ke grup tujuan → kirim pesan apa saja di grup → buka `https://api.telegram.org/bot<TOKEN>/getUpdates` di browser → cari `"chat":{"id": -xxxxx}` (biasanya angka negatif untuk grup)

### Kapan event dikirim & apa isinya

Setiap **tiket dibuat**, **di-assign**, atau **ditutup**, aplikasi mengirim event ke integrasi yang aktif. Kalau **n8n** diisi, payload `POST` JSON yang dikirim:

```json
{
  "event": "ticket_created",
  "event_id": "9c1f2b3a-....-....-....-............",
  "source": "web",
  "actor_name": "Administrator",
  "timestamp": "2026-08-17T10:15:00.000Z",
  "kode_tiket": "TIK-20260817-45211",
  "kode_pelanggan": "11210020",
  "judul": "Internet mati total",
  "pelanggan": "Nama Pelanggan",
  "lokasi": "Nama Site",
  "prioritas": "urgent",
  "status": "open",
  "assigned_to": "Riki, Hanang",
  "penyebab": null,
  "tindakan": null,
  "catatan": null
}
```

`event` berisi salah satu dari: `ticket_created`, `ticket_assigned`, `ticket_closed`.

Kalau **Telegram** diisi, pesan terformat dikirim langsung ke grup (terpisah dari payload n8n di atas).

Setiap event **selalu tercatat** di tabel `activity_logs` (kolom `n8n_event_id`) terlepas dari integrasi aktif/tidak, berhasil/gagal — jadi selalu ada jejak audit di database.

Kalau kedua integrasi kosong, aplikasi tidak akan error — event cuma dilewati (dicatat di `console.warn`/log container), supaya tidak mengganggu proses membuat/mengubah tiket.

---

## 🔎 Live Search

Semua kolom pencarian (Data Pelanggan, Tiket Gangguan) sudah **live** — filter otomatis jalan sendiri saat Anda berhenti mengetik (sekitar 400ms), tanpa perlu klik tombol atau tekan Enter. Filter dropdown (status, prioritas, site) langsung ter-apply begitu dipilih. Ada indikator loading kecil (spinner) di pojok kanan input pencarian saat filter sedang diproses.

---

## 🎫 Alur Buat Tiket Baru

1. **Pilih Site dulu** — kolom Pelanggan otomatis terfilter hanya menampilkan pelanggan di site tersebut (kalau site tidak dipilih, semua pelanggan tetap muncul)
2. **Cari Pelanggan via live search** — bukan dropdown biasa, tapi kotak pencarian: ketik nama atau kode pelanggan, langsung muncul daftar tersaring, klik salah satu untuk pilih. Kalau site diganti, pilihan pelanggan otomatis reset (supaya tidak salah kirim ID dari site lain)
3. **CC / Customer Service** — isi nama CS yang membuat tiket ini (opsional)
4. **Assign Teknisi** — daftar checkbox, bisa pilih **lebih dari satu teknisi sekaligus**, atau centang **"Pilih Semua Teknisi"**. Nama-nama yang dipilih otomatis digabung dengan koma (format sama seperti data lama Anda, misalnya `"Riki, Hanang"`)
5. Fitur multi-select teknisi yang sama juga tersedia di halaman **detail/edit tiket**, dengan checkbox yang otomatis tercentang sesuai teknisi yang sudah di-assign sebelumnya. Di halaman ini ada **dua field terpisah**: **CC** (nama Customer Service, biasanya sudah terisi dari saat dibuat) dan **NOC** (isi nama NOC yang menutup tiket ini saat status diubah ke Closed) — keduanya tersimpan sebagai kolom berbeda di database, bukan satu field yang dipakai bergantian

---

## 📈 Laporan & Analisis

Menu **Laporan & Analisis** di sidebar (juga ada shortcut-nya di Dashboard) — 4 laporan yang semuanya bisa diklik untuk lihat detail lengkap, bukan cuma angka statis:

| # | Laporan | Goal | URL |
|---|---|---|---|
| 1 | Rekap & Klasifikasi Keluhan | Tahu masalah tersering & area prioritas | `/laporan/klasifikasi` |
| 2 | Analisis Penyebab per Area | Tindakan pencegahan per area (mingguan) | `/laporan/penyebab` |
| 3 | Monitoring SLA | Kurangi tiket yang terlambat ditangani | `/laporan/sla` |
| 4 | Laporan Bulanan | Dasar evaluasi manajemen (bisa dicetak) | `/laporan/bulanan` |

**Cara kerja klasifikasi keluhan**: sistem menebak jenis gangguan dari kata kunci di judul/kategori tiket (LOS, Lemot, Putus-putus, Billing, Perangkat, atau "Lainnya" kalau tidak cocok kata kunci apapun). Aturan kata kuncinya ada di `lib/laporan.js` fungsi `klasifikasiKeluhan()` — tambahkan pola regex baru di sana kalau ingin kategori lain.

**Kartu statistik di Dashboard sekarang semua bisa diklik** — kartu "Tiket Open" ke daftar tiket open, "Belum Di-assign" ke laporan SLA, kartu "Status Tiket" dan "Ringkasan Kinerja" masing-masing punya link "Lihat detail" di bawahnya.

---

## 📲 Workflow n8n Siap Pakai (`tara-workflow-tiket.json`)

File workflow n8n disediakan terpisah dari kode web (bukan di dalam folder `nextapp`). Workflow ini gabungan dua hal:

1. **Bot Telegram "TARA"** (AI Agent) — teknisi bisa kirim perintah lewat chat Telegram untuk buat/update/cek tiket, sama seperti sebelumnya, sekarang dengan field `cc` yang mendukung dua peran (CS saat create, NOC saat closed)
2. **Notifikasi dari Web App** — jalur terpisah yang menerima event dari halaman **Pengaturan** (`N8N_WEBHOOK_URL`) setiap kali tiket dibuat/di-assign/ditutup **lewat website**, lalu diteruskan ke Telegram dengan format identik
3. **Reminder otomatis** — dijalankan setiap 30 menit, mencari tiket open yang sudah lewat target SLA (belum di-assign teknisi, atau belum selesai), kirim notifikasi 🔔 ke Telegram, dan mencatat ke `ticket_reminder_logs`

### Cara import ke n8n

1. Buka n8n Anda → **Workflows** → **Import from File** → pilih `tara-workflow-tiket.json`
2. **Pastikan database sudah punya kolom `noc`** di tabel `tickets` (jalankan `npx prisma db push` di web app dulu — kolom ini dipakai bot Telegram juga, terpisah dari kolom `cc`)
3. **Sambungkan ulang credentials** — file ini tidak membawa credential sungguhan (token bot Telegram, koneksi MySQL). Buka setiap node yang butuh credential (`Telegram Trigger`, `Send a text message`, semua node MySQL, `OpenAI Chat Model`) dan pilih/isi credential Anda sendiri
4. **Ganti Chat ID grup** — cari `-1003994916701` di 2 node (`Format Notif Grup` dan `Format Notif dari Web`, juga `Build Reminder Message`), ganti dengan `chat_id` grup Telegram Anda
5. **Aktifkan workflow** (toggle jadi Active di kanan atas)
6. Salin **Production URL** dari node `Webhook` → tempel ke halaman **Pengaturan** di web app, field **Webhook n8n**

### Notifikasi yang dikirim ke Telegram

| Kejadian | Header pesan |
|---|---|
| Tiket baru dibuat | 🚨 **Tiket Baru** |
| Tiket di-assign teknisi | 👨‍🔧 **Tiket Di-assign** (+ baris "Mohon dibantu cek ke lokasi...") |
| Tiket ditutup | ✅ **TIKET CLOSED** |
| Tiket overdue (belum selesai lewat SLA) | 🔔 **REMINDER TIKET BELUM SELESAI** (otomatis tiap 30 menit) |

Semua notifikasi memakai format tabel tiket lengkap (Kode Tiket, Pelanggan, Status checklist, Hasil Penanganan, CC) — persis seperti yang sudah Anda tentukan.

> ⚠️ **Catatan jujur**: workflow ini saya susun & validasi struktur JSON + syntax JavaScript-nya secara menyeluruh, tapi saya tidak punya akses ke instance n8n sungguhan untuk menjalankannya end-to-end. Setelah import, **tes satu-satu setiap cabang** (create → assign → closed → reminder) sebelum mengandalkannya di produksi, terutama bagian regex pencocokan nama teknisi di `Format Notif Grup` dan query SLA overdue di `Cari Tiket Overdue`.

---

## Struktur Proyek

```
app/
  layout.js                    — root layout, providers, font, viewport meta
  page.js                      — redirect ke /login atau /dashboard
  login/page.jsx                — halaman login (client component)
  api/auth/[...nextauth]/       — handler NextAuth
  (dashboard)/                   — route group terproteksi (via middleware.js)
    layout.js                    — pasang AppShell (sidebar + topbar + max-width center)
    dashboard/page.jsx            — statistik
    pelanggan/                    — CRUD data pelanggan + live search
    tickets/                       — CRUD tiket, site→pelanggan (live search), multi-assign teknisi, CC/NOC, integrasi n8n/Telegram
    sites/, teknisi/, sla/         — CRUD pendukung
    settings/                      — form kredensial n8n & Telegram (disimpan di DB, defensif kalau tabel belum ada)
    laporan/                        — hub + 4 halaman laporan (klasifikasi, penyebab, sla, bulanan)
components/                     — komponen React reusable:
  AppShell.jsx                               — pembungkus sidebar+header+main, kelola state mobile menu
  Sidebar.jsx                                 — navigasi (menerima open/onClose dari AppShell)
  PelangganFilters.jsx, TicketFilters.jsx     — live search (debounce) untuk halaman list
  PelangganCombobox.jsx                       — live search pelanggan di form buat tiket (ganti dropdown)
  TicketCreateForm.jsx                        — form buat tiket, site→pelanggan filter
  TeknisiMultiSelect.jsx                      — checkbox multi-pilih teknisi + "Pilih Semua"
  CrudModal.jsx, DeleteButton.jsx, dll
lib/
  prisma.js                     — Prisma Client singleton
  auth.js                       — konfigurasi NextAuth
  settings.js                   — baca/simpan kredensial integrasi dari database (defensif)
  n8n.js                        — kirim event tiket ke n8n webhook & Telegram (kredensial dari lib/settings.js)
  laporan.js                    — helper query 4 jenis laporan/analisis (klasifikasi, penyebab, SLA, bulanan)
prisma/
  schema.prisma                 — skema database (mapping ke tabel asli + tabel settings)
  seed.js                        — buat akun admin default + baris setting kosong
database/imports/data.sql       — data lama dari dump SQL Anda
middleware.js                    — proteksi route (redirect ke /login kalau belum auth)

tara-workflow-tiket.json         — (file terpisah, di luar folder ini) workflow n8n lengkap:
                                    bot Telegram + notifikasi web + reminder otomatis
```

## Kenapa Server Actions, bukan API Routes terpisah?

Aplikasi ini pakai **Next.js Server Actions** (`'use server'`) untuk semua operasi create/update/delete — form langsung memanggil fungsi server tanpa perlu bikin file `route.js` terpisah untuk tiap endpoint. Ini pola resmi & direkomendasikan Next.js App Router untuk form mutation, jadi jumlah file lebih sedikit dan lebih mudah dirawat dibanding REST API klasik.

---

## Troubleshooting

- **`Prisma Client is not configured` / error generate**: jalankan `npx prisma generate` setelah `npm install` (langkah ini butuh koneksi internet ke `binaries.prisma.sh` untuk download query engine).
- **`Error: connect ECONNREFUSED` saat `prisma db push`**: pastikan MySQL sudah jalan dan `DATABASE_URL` di `.env` benar.
- **Foreign key error saat import `data.sql`**: pastikan `npx prisma db push` sudah dijalankan lebih dulu (tabel harus ada sebelum data diimpor), dan jangan import manual di luar urutan yang sudah disediakan.
- **Login gagal terus padahal email/password benar**: cek `NEXTAUTH_SECRET` sudah diisi di `.env` (kalau kosong, session tidak akan tersimpan dengan benar).
- **`BigInt` error di halaman Teknisi**: kolom `telegram_user_id` bertipe `BigInt` di database — sudah ditangani dengan konversi ke string di `app/(dashboard)/teknisi/page.jsx` sebelum dikirim ke client component. Kalau menambah field BigInt baru, ingat untuk konversi serupa.

### Troubleshooting khusus Docker

- **Container `app` langsung mati / restart terus**: karena tidak ada entrypoint script lagi, penyebab paling umum adalah `npm run build` gagal saat build image (cek `docker compose logs app` atau output `docker compose up --build`) — biasanya karena error kode atau `npx prisma generate` gagal karena tidak ada internet ke `binaries.prisma.sh`.
- **Halaman error "Table doesn't exist" setelah container jalan**: wajar — jalankan Langkah 3 di atas dulu (`prisma db push`, import data, seed), karena tidak ada lagi otomatisasi yang menjalankan ini saat container start.
- **Build gagal di step `npx prisma generate` / `npm run build`**: pastikan mesin Docker Anda punya akses internet ke `registry.npmjs.org` dan `binaries.prisma.sh`.
- **Env `NEXTAUTH_SECRET` tidak terbaca**: pastikan file `.env` di root folder (bukan di dalam container) sudah dibuat sebelum `docker compose up`, karena docker-compose membaca variabel substitusi `${...}` dari situ.

### Troubleshooting event ke n8n

- Cek log container/konsol untuk pesan `tidak dikirim ke n8n: webhook URL belum diisi di Settings` atau `Gagal kirim ke n8n`/`Gagal kirim Telegram`, dan pastikan workflow n8n sudah **Active** dengan Webhook di mode **Production URL**.
- **Sudah isi di halaman Settings tapi tetap tidak terkirim**: cek lagi apakah tombol "Simpan Pengaturan" benar-benar sukses (harus muncul notifikasi hijau). Buka `/settings` lagi untuk pastikan nilainya benar-benar tersimpan di database.

### Troubleshooting halaman Settings tidak bisa dibuka

- **Muncul kotak kuning "Tabel settings belum ada"**: ini bukan bug — halaman sengaja menampilkan pesan ini (bukan crash) kalau tabel `settings` belum tersinkron. Jalankan `npx prisma generate && npx prisma db push` (atau versi Docker-nya), lalu refresh halaman.
- **Masih error setelah `db push`**: cek `npx prisma studio` untuk pastikan tabel `settings` benar-benar sudah muncul di database yang sama dengan `DATABASE_URL` di `.env` Anda.

### Troubleshooting responsif (mobile/desktop)

- **Tampilan masih terasa "kebesaran" di HP tertentu**: coba hard refresh (bukan cuma reload biasa) — beberapa browser mobile nge-cache viewport lama. Kalau masih terjadi, cek apakah ada extension/proxy yang mengubah header response.
- **Sidebar tidak mau ketutup setelah klik menu di mobile**: pastikan Anda pakai build terbaru — `Sidebar.jsx` sekarang menerima `onClose` dari `AppShell.jsx`, kalau ada cache build lama (`.next/` folder) hapus dulu (`rm -rf .next`) lalu `npm run build` ulang.
=======
# Ticketing
>>>>>>> 8d23c9594d9dcbd8f8aeee9c617484fb47f8e596
