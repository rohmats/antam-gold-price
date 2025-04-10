# Harga Emas Antam

Aplikasi Streamlit untuk memvisualisasikan harga jual, beli, dan selisih harga emas Antam menggunakan data dari API [logam-mulia](https://logam-mulia.vercel.app/).

## Fitur

- **Grafik Interaktif**: Menampilkan grafik harga jual, beli, dan selisih harga emas Antam.
- **Tabel Data**: Menampilkan data harga dalam format tabel dengan format Rupiah.
- **Filter Rentang Tanggal**: Memungkinkan pengguna untuk memilih rentang tanggal data yang ingin ditampilkan.
- **Fallback Data Lokal**: Jika API tidak dapat diakses, aplikasi akan menggunakan data lokal yang telah disimpan sebelumnya.
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

## Cara Menjalankan Aplikasi

1. **Persyaratan**:
   - Python 3.7 atau lebih baru.
   - File `requirements.txt` untuk menginstal dependensi.

2. **Instalasi Dependensi**:
   Jalankan perintah berikut untuk menginstal dependensi:
   ```bash
   pip install -r requirements.txt