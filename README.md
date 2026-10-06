# Sistem Informasi Organisasi V1.1 — Frontend GitHub / Netlify

Frontend static SPA yang langsung memanggil Web App Google Apps Script V1.1.

## Struktur
- `index.html` — entry point
- `assets/css/app.css` — UI
- `assets/js/config.js` — URL API
- `assets/js/api.js` — wrapper endpoint Apps Script
- `assets/js/auth.js` — session/login/logout
- `assets/js/app.js` — router dan bootstrap
- `assets/js/ui.js` — komponen UI
- `assets/js/pages.js` — halaman publik/dashboard
- `netlify.toml`, `_redirects` — konfigurasi Netlify

## Setup
1. Copy `assets/js/config.example.js` menjadi `assets/js/config.js`.
2. Isi `API_URL` dengan URL Web App Apps Script hasil Deploy > New deployment > Web app.
3. Pastikan backend Apps Script sudah memiliki `SPREADSHEET_ID` dan folder Drive.
4. Upload folder ini ke GitHub atau drag-and-drop ke Netlify.
5. Buka `/` untuk website publik.
6. Gunakan `/login` untuk masuk dashboard.

## Format request
Frontend menggunakan POST `text/plain` berisi JSON agar request lintas-origin tetap sederhana:

```json
{
  "path": "/auth/login",
  "username": "admin",
  "password": "password"
}
```

Backend V1.1 membaca `e.postData.contents`, sehingga format ini kompatibel dengan `parseRequest_()`.

## Endpoint yang digunakan
Public:
- `/public/home`
- `/public/profile`
- `/public/news`
- `/public/gallery`
- `/public/gallery/photos`
- `/public/agenda`
- `/public/download`
- `/public/statistics`
- `/public/regions`

Auth:
- `/auth/login`
- `/auth/register`
- `/auth/logout`
- `/auth/session`
- `/auth/change-password`

Protected:
- `/dashboard`
- `/users`
- `/users/create`
- `/users/reset-password`
- `/members`
- `/members/get`
- `/members/update-self`
- `/members/submit-change`
- `/members/verify`
- `/pengurus`
- `/pengurus/create`
- `/pengajuan`
- `/pengajuan/create`
- `/surat`
- `/surat/create`
- `/surat/detail`
- `/surat/templates`
- `/surat/templates/create`
- `/surat/generate-pdf`
- `/website/manage`
- `/announcements`
- `/logs`
- `/reports`
- `/backup`
- `/drive/upload`
- `/drive/file`
- `/positions`
- `/positions/create`
- `/settings`
- `/settings/set`

## Catatan
- UI tidak menentukan keamanan. Backend tetap menjadi sumber kebenaran untuk role, permission, dan wilayah.
- Token session disimpan di `sessionStorage`, bukan password.
- Password tidak pernah disimpan di frontend.
- Password sementara hasil reset hanya ditampilkan sekali pada dialog hasil reset.
