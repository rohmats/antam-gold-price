# Quick Start Guide

## For Development/Testing

### Setup
```bash
# Install Node.js and Python dependencies
npm install
pip install -r requirements.txt
```

### Run Scraper Manually
```bash
npm run scrape
```

This will:
- Scrape SELL prices from logammulia.com
- Scrape BUY prices from logammulia.com
- Save data to `data/sell/` and `data/buy/` folders
- Update `antam_sell.json` and `antam_buy.json` in root

### Run Dashboard
```bash
streamlit run app.py
```

Visit `http://localhost:8501` in your browser.

---

## For Production (GitHub Actions)

The scraper runs **automatically 3 times per day**:
- **07:00 WIB** (00:00 UTC) - Morning update
- **15:00 WIB** (08:00 UTC) - Afternoon update  
- **23:00 WIB** (16:00 UTC) - Evening update

### Manual Trigger
To run the scraper immediately:

1. Go to GitHub Actions tab in your repository
2. Select "Scrape ANTAM Gold Prices" workflow
3. Click "Run workflow"
4. Select branch (main) and click "Run workflow"

---

## Folder Structure After First Run

```
antam-gold-price/
├── data/
│   ├── sell/
│   │   ├── gold-latest.json      ← Current sell prices
│   │   ├── gold-2025-12-25.json  ← Daily archive
│   │   └── gold-2025-12-24.json  ← Yesterday's data
│   └── buy/
│       ├── gold-latest.json      ← Current buy prices
│       ├── gold-2025-12-25.json  ← Daily archive
│       └── gold-2025-12-24.json  ← Yesterday's data
├── antam_sell.json               ← Latest sell prices (used by app.py)
├── antam_buy.json                ← Latest buy prices (used by app.py)
└── [other files...]
```

---

## Data Format

Both scraper outputs and JSON files use this format:
```json
[
  [timestamp, price],
  [1703520000, 1234567],
  [1703606400, 1234890],
  ...
]
```

Where:
- `timestamp` = Unix timestamp (seconds since epoch)
- `price` = Price in IDR (Indonesian Rupiah)

---

## Troubleshooting

### "npm: command not found"
Install Node.js: `apt-get install nodejs npm` (on Linux/WSL)

### Scraper times out
- Check internet connection
- Try increasing delay in `scraper.js` (line 89 and 147)

### GitHub Actions workflow fails
- Check workflow logs in Actions tab
- Ensure Node.js 18 is available
- Verify repository has write permissions

### Data not updating in dashboard
- Check that scraper created files in `data/` folder
- Verify `antam_sell.json` and `antam_buy.json` exist
- Restart Streamlit app with `Ctrl+C` then `streamlit run app.py`

---

## Files to Monitor

- **Scraper logs**: Check GitHub Actions tab for detailed logs
- **Data files**: Check `data/sell/` and `data/buy/` folders
- **Root JSONs**: Check `antam_sell.json` and `antam_buy.json`
- **Dashboard**: Open Streamlit app at `http://localhost:8501`

---

## API Endpoints Being Scraped

| Type | URL | Frequency |
|------|-----|-----------|
| SELL | `https://www.logammulia.com/data-base-price/gold_eai/sell` | 3x daily |
| BUY  | `https://www.logammulia.com/data-base-price/gold/buy` | 3x daily |

---

For detailed information, see [README.md](README.md) and [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
