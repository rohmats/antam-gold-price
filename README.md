# Harga Emas Antam

Aplikasi Streamlit untuk memvisualisasikan harga jual, beli, dan selisih harga emas Antam menggunakan data dari API [logam-mulia](https://logam-mulia.vercel.app/).

## Fitur

- **Grafik Interaktif**: Menampilkan grafik harga jual, beli, dan selisih harga emas Antam.
- **Tabel Data**: Menampilkan data harga dalam format tabel dengan format Rupiah.
- **Filter Rentang Tanggal**: Memungkinkan pengguna untuk memilih rentang tanggal data yang ingin ditampilkan.
- **Fallback Data Lokal**: Jika API tidak dapat diakses, aplikasi akan menggunakan data lokal yang telah disimpan sebelumnya.
- **Simulasi Buyback**: Menghitung estimasi keuntungan atau kerugian dari buyback emas berdasarkan data historis.
- **Status API**: Menampilkan status pengambilan data dari API.

## Teknologi yang Digunakan

- **Python**: Bahasa pemrograman utama.
- **Streamlit**: Framework untuk membuat aplikasi web interaktif.
- **Pandas**: Untuk manipulasi dan analisis data.
- **Plotly**: Untuk membuat grafik interaktif.
- **Requests**: Untuk mengambil data dari API.

## Cara Kerja

1. **Pengambilan Data**:
   - Aplikasi mengambil data harga jual dan beli emas Antam dari API [logam-mulia](https://logam-mulia.vercel.app/).
   - Data yang berhasil diambil akan disimpan ke file lokal (`antam_sell.json` dan `antam_buy.json`).

2. **Fallback ke Data Lokal**:
   - Jika API tidak dapat diakses, aplikasi akan membaca data dari file lokal.

3. **Proses Data**:
   - Data dari API atau file lokal diproses menjadi DataFrame menggunakan Pandas.
   - Data digabungkan berdasarkan tanggal, dan kolom selisih harga (jual - beli) ditambahkan.

4. **Visualisasi**:
   - Data divisualisasikan dalam bentuk grafik interaktif menggunakan Plotly.
   - Data juga ditampilkan dalam tabel dengan format tanggal dan nilai dalam Rupiah.

5. **Filter Rentang Tanggal**:
   - Pengguna dapat memilih rentang tanggal melalui sidebar untuk memfilter data yang ditampilkan.

6. **Simulasi Buyback**:
   - Pengguna dapat menghitung estimasi keuntungan atau kerugian dari buyback emas berdasarkan jumlah emas, tanggal pembelian, dan harga terkini.

## Cara Menjalankan Aplikasi

1. **Persyaratan**:
   - Python 3.7 atau lebih baru.
   - File `requirements.txt` untuk menginstal dependensi.

2. **Instalasi Dependensi**:
   Jalankan perintah berikut untuk menginstal dependensi:
   ```bash
   pip install -r requirements.txt
   ```

3. **Menjalankan Aplikasi**:
   Jalankan perintah berikut untuk memulai aplikasi:
   ```bash
   streamlit run app.py
   ```

4. **Akses Aplikasi**:
   Buka browser dan akses aplikasi di alamat yang ditampilkan (biasanya `http://localhost:8501`).

## Catatan

- Data diambil dari API dan disimpan secara lokal.
- Jika API tidak dapat diakses, aplikasi akan menggunakan data lokal.
- Pastikan file lokal (`antam_sell.json` dan `antam_buy.json`) tersedia jika API tidak dapat diakses.

## Status API

- API menggunakan [logam-mulia API](https://logam-mulia.vercel.app/) yang dibuat oleh [ferryops](https://github.com/ferryops/logam-mulia).

## Disclaimer

- Perhitungan simulasi buyback hanya bersifat estimasi.
- Belum memperhitungkan biaya transaksi, pajak, atau biaya lainnya.
- Harga buyback dapat berubah sewaktu-waktu sesuai kebijakan penyedia layanan.