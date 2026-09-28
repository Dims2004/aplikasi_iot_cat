# CatFeeder – Smart Feeder IoT (React + Tailwind + MQTT.js)

## Cara menjalankan di Visual Studio Code
1. Install **Node.js LTS** (https://nodejs.org) jika belum ada.
2. Ekstrak zip, lalu di VS Code pilih **File → Open Folder…** → pilih folder `catfeeder`.
3. Klik **Install** pada popup rekomendasi ekstensi (Tailwind CSS IntelliSense) – opsional.
4. Buka terminal (**Ctrl + `**) lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
   Alternatif: **Terminal → Run Task… → Install dependencies**, lalu **Run Build Task (Ctrl+Shift+B)**.
5. Buka alamat yang muncul (biasanya http://localhost:5173).

Build produksi: `npm run build` (hasil di folder `dist/`).

## Mode Demo & MQTT
- Secara default **Mode Demo aktif**: data pakan/air disimulasikan realtime di browser, tanpa ESP32.
- Untuk memakai ESP32 asli: **Profil → Pengaturan Perangkat → matikan Mode Demo**.
- Web terhubung ke broker lewat WebSocket (default `wss://broker.emqx.io:8084/mqtt`). Broker & topic bisa diubah di halaman yang sama.

**ESP32 → Web** (topic `catfeeder/esp32/data`), kirim JSON berkala:
```json
{ "weight": 250, "water": 320, "wifi": true }
```
**Web → ESP32** (topic `catfeeder/esp32/control`):
```json
{ "cmd": "feed", "amount": 50 }
{ "cmd": "water", "amount": 100 }
{ "cmd": "schedule", "auto": true, "items": [{ "name": "Pagi", "time": "07:00", "amount": 50, "on": true }] }
{ "cmd": "calibrate_scale" }   { "cmd": "calibrate_water" }
```
Jadwal dikirim dengan flag *retain*. Broker publik bersifat terbuka: ganti nama topic dengan yang unik.

## Fitur
Beranda, Perangkat, Jadwal Makan, Beri Pakan Manual, Notifikasi, Riwayat + grafik, Profil, Pengaturan Perangkat, Edit Profil, menu mobile (drawer + bottom nav), mode gelap/terang, Bahasa Indonesia/English.

## Install di HP (PWA)
Aplikasi ini sudah PWA. Syaratnya harus dibuka lewat **HTTPS** (atau localhost) – alamat `http://192.168.x.x` di HP tidak bisa di-install.
1. `npm run build`, lalu upload isi folder `dist/` ke hosting HTTPS gratis (Netlify Drop, Vercel, Cloudflare Pages, atau GitHub Pages).
2. Buka link-nya di HP:
   - **Android (Chrome):** tekan tombol *Install Aplikasi* di menu, atau menu ⋮ → *Install app / Add to Home screen*.
   - **iPhone (Safari):** Bagikan → *Tambah ke Layar Utama*.
