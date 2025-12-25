# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      logammulia.com                         │
│                                                             │
│  /data-base-price/gold_eai/sell    /data-base-price/gold/buy
└────────────────────┬──────────────────────────┬─────────────┘
                     │                          │
                     │ HTTPS GET (with token)  │
                     │                          │
        ┌────────────▼──────────────┬──────────▼────────┐
        │                           │                  │
        │  Browser (Puppeteer)      │  Browser Page    │
        │  - Extracts CSRF token    │                  │
        │  - Stealth mode enabled   │                  │
        │                           │                  │
        └────────────┬──────────────┴──────────┬────────┘
                     │                        │
                     │ Parse JSON             │
                     │                        │
        ┌────────────▼───────────────────────▼────────┐
        │           scraper.js                       │
        │  ✓ Deduplicates data (date + price)        │
        │  ✓ Sorts chronologically                   │
        │  ✓ Creates timestamped archives            │
        └──────┬──────────────────────┬───────────────┘
               │                      │
        ┌──────▼────────┐      ┌──────▼──────────┐
        │  data/sell/   │      │   data/buy/     │
        │ ├ latest      │      │  ├ latest       │
        │ ├ 2025-12-25  │      │  ├ 2025-12-25   │
        │ └ 2025-12-24  │      │  └ 2025-12-24   │
        └──────┬────────┘      └──────┬──────────┘
               │                      │
               │ Copy to root         │
               │                      │
        ┌──────▼───────┐       ┌──────▼──────────┐
        │antam_sell.json      antam_buy.json│
        └──────┬───────┘       └──────┬──────────┘
               │                      │
               │ Read                 │
               │                      │
        ┌──────▼───────────────────────▼──────┐
        │         app.py (Streamlit)         │
        │  ✓ Load data from JSON files       │
        │  ✓ Parse timestamps & prices      │
        │  ✓ Create interactive charts      │
        │  ✓ Show buy/sell/spread data      │
        │  ✓ Buyback simulator             │
        └──────┬───────────────────────────┘
               │
               │ HTTP (localhost:8501)
               │
        ┌──────▼──────────┐
        │ User Dashboard  │
        │ (Web Browser)   │
        └─────────────────┘
```

## Data Flow

### Execution Trigger
```
┌─────────────────────────────────────────┐
│  GitHub Actions Scheduler               │
│  - 00:00 UTC (07:00 WIB)               │
│  - 08:00 UTC (15:00 WIB)               │
│  - 16:00 UTC (23:00 WIB)               │
│  OR Manual via Actions tab              │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │ .github/        │
        │ workflows/      │
        │ scrape.yml      │
        └────────┬────────┘
                 │
        ┌────────▼──────────────────┐
        │ 1. Checkout code         │
        │ 2. Setup Node.js 18      │
        │ 3. npm install           │
        │ 4. npm run scrape        │
        │ 5. git commit & push     │
        └────────┬──────────────────┘
                 │
        ┌────────▼────────┐
        │  scraper.js     │
        │  Runs & Updates │
        │  JSON files     │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Files Change    │
        │ Changes pushed  │
        │ to repo         │
        └─────────────────┘
```

### User Access Flow
```
User visits repo or dashboard
        │
        ├─→ See antam_sell.json (raw or via API)
        ├─→ See antam_buy.json (raw or via API)
        │
        └─→ Run Streamlit app (app.py)
            │
            ├─→ Load antam_sell.json
            ├─→ Load antam_buy.json
            │
            ├─→ Process with Pandas
            │
            ├─→ Render with Plotly
            │
            └─→ Display interactive dashboard
```

## Component Responsibilities

### scraper.js
- **Responsibility**: Web scraping and data collection
- **Input**: logammulia.com website
- **Output**: JSON files in `data/sell/`, `data/buy/`, and root JSON files
- **Triggers**: GitHub Actions schedule or manual
- **Technology**: Puppeteer, Node.js

### GitHub Actions Workflow (scrape.yml)
- **Responsibility**: Automation and scheduling
- **Triggers**: Cron schedule (3x daily) or manual dispatch
- **Steps**: Install deps, run scraper, commit & push
- **Frequency**: 3 times per day

### app.py
- **Responsibility**: Data visualization and user interface
- **Input**: JSON files (antam_sell.json, antam_buy.json)
- **Output**: Interactive web dashboard
- **Technology**: Streamlit, Pandas, Plotly

### Data Storage
- **Purpose**: Persistence and historical analysis
- **Structure**: Separated by type (sell/buy), dated archives
- **Retention**: All daily archives kept indefinitely

## Key Features

### Data Integrity
```
Raw Data → Deduplication → Sorting → Archives + Latest → Dashboard
           (date+price)   (timestamp)  (daily+current)   (visualization)
```

### Redundancy
```
data/sell/gold-latest.json  ──┐
                             ├→ antam_sell.json (root) ──→ Dashboard
daily archives             ──┘

data/buy/gold-latest.json   ──┐
                             ├→ antam_buy.json (root) ──→ Dashboard
daily archives             ──┘
```

### Automation
```
Schedule/Manual Trigger
        │
        ├→ Extract Token (auto)
        ├→ Fetch Sell Data (auto)
        ├→ Fetch Buy Data (auto)
        ├→ Deduplicate (auto)
        ├→ Save to Files (auto)
        └→ Commit & Push (auto) ←── NO MANUAL INTERVENTION NEEDED
```

## Technology Stack

```
Frontend:
└─ Streamlit (Python web framework)
   ├─ Pandas (data processing)
   └─ Plotly (visualization)

Backend Scraper:
└─ Node.js
   ├─ Puppeteer-extra (browser automation)
   ├─ Puppeteer-stealth (avoid detection)
   └─ Dayjs (date manipulation)

Automation:
└─ GitHub Actions
   ├─ Scheduled cron jobs
   └─ Manual trigger support

Data Storage:
└─ JSON files (versioned in Git)
```

## Performance Characteristics

| Operation | Time | Frequency |
|-----------|------|-----------|
| Scrape SELL + BUY | ~15-30 sec | 3x per day |
| Commit & Push | ~5-10 sec | 3x per day |
| Data Deduplication | <1 sec | 3x per day |
| Dashboard Load | <2 sec | On-demand |
| Chart Render | <3 sec | On-demand |

## Security Considerations

- **No API Keys**: Uses browser CSRF tokens (auto-extracted)
- **Stealth Mode**: Puppeteer stealth plugin to avoid bot detection
- **No User Data**: Only scrapes public price data
- **GitHub Token**: Uses standard GitHub Actions token for commits
- **Data Privacy**: All data is public market prices

## Scalability

Currently designed for:
- Single gold type (ANTAM)
- 2 endpoints (sell + buy)
- 3 daily updates
- ~200KB data per day (~6MB per month)

To scale:
1. Add more endpoints in scraper.js
2. Increase cron frequency
3. Archive strategy for older data
4. Consider database instead of JSON

## Failure Scenarios & Recovery

| Failure | Impact | Recovery |
|---------|--------|----------|
| Network error | Data not updated | Retry on next schedule |
| Token extraction fails | No data collected | Manual investigation |
| File write fails | Data lost | Check disk space |
| GitHub push fails | Data not versioned | Check permissions |
| Dashboard API down | API alternative | Use local files |

All recovery is automatic on next scheduled run.
