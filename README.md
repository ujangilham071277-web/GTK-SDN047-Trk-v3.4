# Administrasi GTK SDN 047 Tarakan - Frontend (GitHub Pages)

Frontend statis (HTML/CSS/JS) untuk aplikasi Administrasi GTK SDN 047 Tarakan.
Backend: Google Apps Script sebagai REST API + Google Sheets/Drive.

## Struktur
```
index.html
css/style.css
js/config.js   <- ISI GAS_URL (URL /exec Apps Script) sebelum push
js/app.js
```

## Cara pakai singkat
1. Deploy backend `Kode.gs` sebagai Web App (Execute as: Me, Access: Anyone), salin URL `/exec`.
2. Tempel URL itu ke `js/config.js` pada baris `const GAS_URL`.
3. Push folder ini ke GitHub, aktifkan Pages (branch `main`, folder `/ (root)`, Enforce HTTPS).

Panduan lengkap: lihat `PANDUAN-INSTALASI.md`.
