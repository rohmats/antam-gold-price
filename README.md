# Harga Emas Antam

Aplikasi Streamlit untuk memvisualisasikan harga jual, beli, dan selisih harga emas Antam dengan web scraper otomatis dari situs [logammulia.com](https://www.logammulia.com/).

## Fitur

- **Web Scraper Otomatis**: Mengumpulkan data harga jual dan beli emas Antam langsung dari logammulia.com menggunakan Puppeteer
- **Penjadwalan Otomatis**: GitHub Actions menjalankan scraper 3x sehari (00:00, 08:00, 16:00 UTC)
- **Grafik Interaktif**: Menampilkan grafik harga jual, beli, dan selisih harga emas Antam.
- **Tabel Data**: Menampilkan data harga dalam format tabel dengan format Rupiah.
- **Filter Rentang Tanggal**: Memungkinkan pengguna untuk memilih rentang tanggal data yang ingin ditampilkan.
- **Fallback Data Lokal**: Jika scraper gagal, aplikasi akan menggunakan data lokal yang telah disimpan sebelumnya.
- **Simulasi Buyback**: Menghitung estimasi keuntungan atau kerugian dari buyback emas berdasarkan data historis.
- **Arsip Data Harian**: Menyimpan snapshot data harian untuk analisis historis.

## Teknologi yang Digunakan

### Backend Scraper
- **Node.js**: Runtime JavaScript untuk scraper
- **Puppeteer-extra**: Browser automation dengan stealth plugin
- **Dayjs**: Parsing dan manipulasi tanggal

### Frontend Dashboard
- **Python**: Bahasa pemrograman utama.
- **Streamlit**: Framework untuk membuat aplikasi web interaktif.
- **Pandas**: Untuk manipulasi dan analisis data.
- **Plotly**: Untuk membuat grafik interaktif.
- **Requests**: Untuk mengambil data dari API.

### Automation
- **GitHub Actions**: Untuk penjadwalan dan menjalankan scraper secara otomatis

## Cara Kerja

### 1. Web Scraping (Automated via GitHub Actions)
- **Penjadwalan**: GitHub Actions menjalankan scraper 3x per hari (00:00, 08:00, 16:00 UTC / 07:00, 15:00, 23:00 WIB)
- **Proses Scraping**:
  - Script `scraper.js` membuka situs logammulia.com menggunakan Puppeteer
  - Mengekstrak CSRF token dari halaman
  - Melakukan fetch ke API endpoint untuk data **SELL** dan **BUY**
  - Data disimpan dengan deduplicasi berdasarkan tanggal dan harga
  - Hasil diarsipkan dalam folder `data/sell` dan `data/buy`
  - File `antam_sell.json` dan `antam_buy.json` di root folder di-update
  - Perubahan otomatis di-push ke repository

### 2. Penyimpanan Data
- **Struktur Folder**:
  ```
  data/
  ├── sell/
  │   ├── gold-latest.json          # Data terbaru
  │   └── gold-YYYY-MM-DD.json      # Arsip harian
  └── buy/
      ├── gold-latest.json          # Data terbaru
      └── gold-YYYY-MM-DD.json      # Arsip harian
  ```
- **Root Files**:
### Setup Lokal

1. **Persyaratan**:
   - Python 3.7 atau lebih baru
   - Node.js 14+ (untuk menjalankan scraper secara manual)

2. **Instalasi Dependensi**:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```

3. **Menjalankan Scraper (Manual)**:
   ```bash
   npm run scrape
   ```

4. **Menjalankan Dashboard**:
   ```bash
   streamlit run app.py
   ```

5. **Akses Aplikasi**:
   Buka browser dan akses aplikasi di `http://localhost:8501`

### Automation via GitHub Actions

Scraper akan berjalan otomatis **3x sehari** berdasarkan GitHub Actions workflow:
- **00:00 UTC** (07:00 WIB)
- **08:00 UTC** (15:00 WIB)
- **16:00 UTC** (23:00 WIB)

Workflow configuration: [.github/workflows/scrape.yml](.github/workflows/scrape.yml)

Untuk menjalankan scraper manual di GitHub Actions:
1. Buka tab "Actions" di repository
2. Pilih workflow "Scrape ANTAM Gold Prices"
3. Klik "Run workflow"

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

## Struktur File

```
antam-gold-price/
├── .github/
│   └── workflows/
│       └── scrape.yml              # GitHub Actions workflow
├── data/
│   ├── sell/
│   │   ├── gold-latest.json
│   │   └── gold-YYYY-MM-DD.json    # Daily archives
│   └── buy/
│       ├── gold-latest.json
│       └── gold-YYYY-MM-DD.json    # Daily archives
├── antam_buy.json                  # Latest buy prices
├── antam_sell.json                 # Latest sell prices
├── app.py                          # Streamlit dashboard
├── scraper.js                      # Web scraper script
├── package.json                    # Node.js dependencies
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## API Endpoints yang Di-Scrape

- **Sell**: `https://www.logammulia.com/data-base-price/gold_eai/sell`
- **Buy**: `https://www.logammulia.com/data-base-price/gold/buy`

Data dikumpulkan dengan menggunakan CSRF token yang diekstrak dari halaman utama situs.

## Catatan

- Data scraping memerlukan akses ke situs logammulia.com
- Puppeteer menggunakan mode headless untuk efisiensi
- Stealth plugin digunakan untuk menghindari deteksi bot
- Deduplicasi otomatis berdasarkan tanggal dan harga
- Data diurutkan secara kronologis

## Troubleshooting

### Scraper gagal karena timeout
- Tingkatkan waktu delay di `scraper.js`
- Pastikan koneksi internet stabil

### Data tidak ter-update di GitHub
- Cek bahwa GitHub Actions workflow aktif di repository settings
- Verifikasi bahwa branch protection rules tidak menghalangi push otomatis

### Aplikasi Streamlit tidak membaca data
- Pastikan file `antam_sell.json` dan `antam_buy.json` ada di root folder
- Check console untuk error messages

## Disclaimer

- Perhitungan simulasi buyback hanya bersifat estimasi
- Belum memperhitungkan biaya transaksi, pajak, atau biaya lainnya
- Harga buyback dapat berubah sewaktu-waktu sesuai kebijakan penyedia layanan
- Data accuracy bergantung pada status situs logammulia.com

## Kontribusi

Pull requests dan issues sangat diterima!