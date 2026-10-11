# PANDUAN INSTALASI - Administrasi GTK SDN 047 Tarakan v3.4
Backend = Google Apps Script (REST API). Frontend = GitHub Pages (HTTPS, sehingga kamera scan QR bisa dibuka langsung).

## A. BACKEND (Google Apps Script)
1. Buka https://script.google.com -> **Proyek baru**.
2. Ganti isi `Code.gs` dengan seluruh isi `Kode.gs` (ganti nama file menjadi **Kode**). **Hapus file HTML lama** (`Index`, `Stylesheet`, `JavaScript`) bila ada: tidak dipakai lagi.
3. Pilih fungsi `setupAppEnvironment` -> **Run** (cukup sekali; aman jika dijalankan ulang). Izinkan akses Drive, Sheets, dan Gmail. Pastikan Execution log bertuliskan "Setup selesai".
   - Jika Anda memakai proyek lama (v2.7), data lama tetap dipakai; setup hanya menambah kolom/sheet yang kurang.
4. **Deploy -> New deployment -> Web app**: Execute as **Me**, Who has access **Anyone** -> Deploy -> salin **URL /exec**.
5. Setiap mengubah `Kode.gs`: Deploy -> Manage deployments -> ikon pensil -> Version **New version** -> Deploy (URL tetap sama).
6. Akun admin awal: username `ujangilham`. **Segera ganti password** di menu Pengaturan setelah login.

## B. FRONTEND (GitHub Pages)
Folder kerja = folder hasil ekstrak ZIP, yaitu **`sdn047-tarakan`**. Di dalamnya langsung ada `index.html`, `css/`, `js/`. Folder inilah yang di-`git init`.

1. Buka `js/config.js`, ganti `PASTE_URL_EXEC_DI_SINI` dengan URL /exec dari langkah A4. Simpan.
2. Instal Git (https://git-scm.com/download/win), lalu buka PowerShell di folder `sdn047-tarakan` (klik address bar File Explorer, ketik `powershell`, Enter).
3. Cek isi folder: `dir` -> harus terlihat `index.html`, `css`, `js`.
4. Buat repository **Public** baru di github.com (jangan centang README/.gitignore/license).
5. Jalankan satu per satu:
```
git config --global user.name "Nama Anda"
git config --global user.email "email@akun-github.com"
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
   Saat diminta password, tempel **Personal Access Token** (github.com/settings/tokens -> classic -> centang `repo`). Layar tidak menampilkan apa pun saat paste: itu normal.
6. Di repo: **Settings -> Pages** -> Source **Deploy from a branch**, Branch **main** / **(root)**, centang **Enforce HTTPS** -> Save. Tunggu 1-2 menit.
7. Buka `https://USERNAME.github.io/NAMA-REPO/`.
8. Login sebagai admin: alamat situs otomatis tersimpan untuk QR sertifikat (bisa dicek/diubah di **Pengaturan -> URL situs**).

## C. UPDATE
```
git add .
git commit -m "Perubahan"
git push
```
Jika tampilan lama masih muncul: Ctrl+Shift+R.

## D. TEST
- Login berhasil, Dashboard tampil.
- **Scan QR -> Nyalakan Kamera** -> izinkan kamera di browser -> arahkan ke kartu siswa.
- F12 -> Console/Network: tidak ada error CORS.

## E. MASALAH UMUM
| Gejala | Solusi |
|---|---|
| "GAS_URL belum diisi" | Isi `js/config.js`, commit, push |
| "Tidak dapat terhubung ke server" | Pastikan deployment Web App: Execute as Me, Access Anyone, URL berakhiran /exec |
| Perubahan backend tidak terlihat | Deploy **New version** |
| 404 di GitHub Pages | `index.html` harus di root repo; push dari folder `sdn047-tarakan` |
| Kamera ditolak | Klik ikon gembok di address bar -> Izinkan kamera -> muat ulang |


## F. PEMBARUAN v3.4 (wajib dibaca saat upgrade dari v3.1)
1. Ganti isi `Kode.gs` di Apps Script, lalu **jalankan ulang `setupAppEnvironment`** (menambah kolom `Sesi` pada sheet Absensi; data lama tetap aman, dianggap sesi Kelas).
2. Google akan meminta **izin baru** (Google Docs & akses eksternal) untuk fitur Word/PDF. Klik Lanjutkan -> Izinkan.
3. Deploy -> Manage deployments -> pensil -> **New version**.
4. Push frontend baru ke GitHub (git add . ; git commit -m "v3.4" ; git push), lalu Ctrl+Shift+R.

Absensi: Guru Kelas = sesi Kelas (harian); Guru PAI = sesi PAI; Guru PJOK = sesi PJOK; Admin bisa semua sesi; Kepala Sekolah hanya melihat. Email ke orang tua hanya untuk sesi Kelas. Peran Guru Mapel tidak memiliki absensi.


## G. PEMBARUAN v3.4
1. Ganti `Kode.gs`, **jalankan ulang `setupAppEnvironment`** (menambah kolom Keterangan & Guru pada Jurnal), lalu Deploy -> New version.
2. Push frontend: git add . ; git commit -m "v3.4" ; git push ; Ctrl+Shift+R. Kartu login harus menampilkan **Versi 3.3**.
3. Baru: menu **Laporan Kehadiran** (filter kelas/tanggal/siswa, % hadir per siswa, unduh Excel/Word/PDF); **impor CSV Data Guru** + tombol template; berkas unggahan otomatis masuk folder `Lampiran/<tahun ajaran>/<modul>` di Drive; peminjaman buku mewajibkan NISN terdaftar.


## H. PEMBARUAN v3.4
1. Ganti `Kode.gs`, **jalankan ulang `setupAppEnvironment`** (membuat sheet TahunAjaran dan kolom TA; tahun ajaran berjalan terisi otomatis), lalu Deploy -> New version.
2. Push frontend (git add . ; git commit -m "v3.4" ; git push), Ctrl+Shift+R. Kartu login harus menampilkan **Versi 3.4**.
3. **Impor CSV** untuk Data Siswa, Data Guru, dan Jurnal Mengajar: semua baris masuk apa adanya sesuai template (data kembar atau kosong tetap diterima). Tombol *Unduh template CSV* ada di dialog impor.
4. **Tahun Ajaran**: pilih di bagian atas halaman. Untuk memulai tahun baru: menu *Tahun Ajaran* -> *Mulai Tahun Ajaran Baru* (opsi naik kelas otomatis). Data lama tetap tersimpan.
