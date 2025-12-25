# Deployment Checklist

## Pre-Deployment

- [ ] Clone/Pull latest code from GitHub
- [ ] Review all changes in [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
- [ ] Check [QUICKSTART.md](QUICKSTART.md) for quick reference

## Local Testing

- [ ] Node.js installed (`node --version` ≥ 14)
- [ ] Python installed (`python --version` ≥ 3.7)
- [ ] Install Node dependencies: `npm install`
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Test scraper: `npm run scrape`
- [ ] Verify `data/sell/` folder created with files
- [ ] Verify `data/buy/` folder created with files
- [ ] Verify `antam_sell.json` updated in root
- [ ] Verify `antam_buy.json` updated in root
- [ ] Test dashboard: `streamlit run app.py`
- [ ] Verify dashboard loads without errors
- [ ] Check charts and data display correctly

## GitHub Configuration

- [ ] Repository has Actions enabled (Settings → Actions → General)
- [ ] Default branch is `main`
- [ ] Branch protection rules allow GitHub Actions to commit/push (if enabled)
- [ ] Repository has read/write permissions for Actions
- [ ] No secrets are hardcoded in code

## Workflow Validation

- [ ] `.github/workflows/scrape.yml` file exists
- [ ] Workflow name: "Scrape ANTAM Gold Prices"
- [ ] Schedule cron: `0 0,8,16 * * *` (UTC times)
- [ ] Node.js version: 18
- [ ] Workflow has `workflow_dispatch` for manual trigger

## Push to GitHub

```bash
# Verify all files are tracked
git status

# Add all new files
git add .

# Commit with meaningful message
git commit -m "Integrate Node.js web scraper for automated gold price collection

- Add scraper.js for SELL and BUY price scraping
- Add GitHub Actions workflow for 3x daily automation
- Create data folder structure for archives
- Update documentation with new architecture
- Add quick start guide"

# Push to main branch
git push origin main
```

- [ ] All files committed successfully
- [ ] Push completes without errors
- [ ] Repository shows updated code on GitHub

## Post-Deployment

### Immediate (within 5 minutes)

- [ ] Go to GitHub Actions tab in repository
- [ ] Verify "Scrape ANTAM Gold Prices" workflow appears
- [ ] Click on workflow and trigger manual run: "Run workflow"
- [ ] Wait for workflow to complete (should take 1-2 minutes)
- [ ] Check workflow logs for any errors:
  - Look for "✅ Token ditemukan"
  - Look for "✅ Buy data parsed"
  - Look for "💾 Disimpan ke" messages
- [ ] Verify files were committed to repository:
  - Check `data/sell/gold-latest.json`
  - Check `data/buy/gold-latest.json`
  - Check `antam_sell.json`
  - Check `antam_buy.json`

### Within 24 Hours

- [ ] First automated run at 00:00 UTC (07:00 WIB)
- [ ] Check GitHub Actions completed successfully
- [ ] Verify new daily files created (gold-YYYY-MM-DD.json)
- [ ] Verify root JSON files updated with new timestamps
- [ ] Check commit messages appear in repository history

### Within 72 Hours (3 days)

- [ ] All 3 daily scheduled runs completed
  - [ ] 00:00 UTC (07:00 WIB)
  - [ ] 08:00 UTC (15:00 WIB)
  - [ ] 16:00 UTC (23:00 WIB)
- [ ] Each run created new commits
- [ ] Each run collected both SELL and BUY data
- [ ] No failed workflow runs

### Production Setup

- [ ] Dashboard (Streamlit) deployed to cloud (if desired)
- [ ] GitHub repository made public (if desired)
- [ ] Repository description updated
- [ ] Topics/labels added: `antam`, `gold-price`, `web-scraper`, `automation`
- [ ] Add to profile/organization repos (if applicable)

## Monitoring & Maintenance

### Weekly
- [ ] Check GitHub Actions history for errors
- [ ] Verify workflow runs at scheduled times
- [ ] Spot-check JSON files for data integrity
- [ ] Check for any increased file sizes (should grow gradually)

### Monthly
- [ ] Review data trends in dashboard
- [ ] Check total data collected (~6MB expected)
- [ ] Archive old daily files if needed (optional)
- [ ] Update documentation if requirements change

### Quarterly
- [ ] Review Puppeteer and dependency versions
- [ ] Check if logammulia.com structure changed
- [ ] Evaluate if scraping frequency needs adjustment
- [ ] Assess data storage strategy

## Rollback Plan

If something goes wrong:

### Option 1: Disable Workflow
```bash
# Edit .github/workflows/scrape.yml
# Comment out the schedule section and commit
git push
```

### Option 2: Revert Last Changes
```bash
git revert HEAD~1
git push
```

### Option 3: Full Rollback
```bash
git reset --hard <previous-commit-hash>
git push --force-with-lease
```

## Troubleshooting During Deployment

### Workflow not showing
- [ ] Refresh GitHub page (F5)
- [ ] Check branch is `main`
- [ ] Verify file path: `.github/workflows/scrape.yml`

### Workflow fails with "npm: command not found"
- [ ] This shouldn't happen (Node.js is pre-installed in GitHub Actions)
- [ ] Check logs for detailed error
- [ ] Verify `package.json` syntax is correct

### Scraper timeout
- [ ] Check logammulia.com is accessible
- [ ] Try increasing delay in scraper.js
- [ ] Run manual test: `npm run scrape`

### Files not being committed
- [ ] Check git config in workflow logs
- [ ] Verify files are actually modified
- [ ] Check branch protection rules (if any)

### Dashboard not loading
- [ ] Verify `antam_sell.json` and `antam_buy.json` exist
- [ ] Check JSON files are valid (use JSONLint)
- [ ] Run locally first: `streamlit run app.py`

## Sign-Off

- Deployment Date: _______________
- Deployed By: _______________
- Testing Verified: [ ]
- Monitoring Active: [ ]
- Ready for Production: [ ]

---

For questions or issues, refer to:
- [QUICKSTART.md](QUICKSTART.md) - Quick reference
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) - What was changed
- [README.md](README.md) - Full documentation
