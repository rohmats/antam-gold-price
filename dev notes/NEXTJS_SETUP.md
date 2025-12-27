# ANTAM Gold Price - Next.js App Setup Guide

## ✅ Completion Summary

Your modern Next.js application has been successfully created with all the features you requested!

### What's Included

#### 🎨 **Design & Theme**
- ✅ Clean, minimalistic UI using shadcn/ui components
- ✅ Light theme as default
- ✅ Dark theme toggle switch in navbar
- ✅ Smooth transitions and animations
- ✅ Fully responsive design (mobile-friendly)
- ✅ Accessible color contrast ratios

#### 📊 **Main Features**
1. **Home Page** (`/`)
   - Interactive Recharts line chart showing:
     - Harga Jual (Sell Price) - Red line
     - Harga Beli (Buy Price) - Green line
     - Spread (Difference) - Blue line with secondary Y-axis
   - Detailed data table with:
     - Centered date column
     - Right-aligned numerical data
     - Price change indicators (↑/↓)
     - Percentage spread calculations
     - 10 items per page pagination
     - Color-coded values (red for sell, green for buy, blue for spread)
   - Quick stats showing:
     - Current sell price
     - Current buy price
     - Current spread
     - Last update date
   - Time range filters:
     - 7 Days Terakhir
     - 30 Hari Terakhir
     - 6 Bulan Terakhir
     - 1 Tahun Terakhir
     - Tampilkan Semua

2. **Simulasi Buyback Page** (`/simulasi`)
   - Input form for:
     - Gold amount (in grams)
     - Purchase date
   - Automatic price lookup from historical data
   - Results table showing:
     - Quantity purchased
     - Purchase date
     - Historical buy price at that date
     - Total purchase amount
     - Current sell value
     - Profit/Loss amount
     - Profit/Loss percentage
   - Summary statistics:
     - Total gold
     - Total investment
     - Total current value
     - Total profit/loss with percentage
   - Delete individual entries
   - Reset all data button
   - Includes disclaimer

#### 🏗️ **Architecture**
- Server-side rendering with Next.js App Router
- TypeScript for type safety
- Client components for interactivity
- Server API route for data loading
- Reusable component architecture
- Optimized performance

#### 🗂️ **File Structure**
```
nextjs-app/
├── app/
│   ├── api/gold-prices/route.ts      # API endpoint
│   ├── simulasi/page.tsx              # Buyback simulation
│   ├── page.tsx                       # Home page
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── components/
│   ├── navigation.tsx                 # Top navbar
│   ├── price-chart.tsx                # Chart component
│   ├── price-table.tsx                # Data table
│   ├── stat-box.tsx                   # Stats card
│   ├── theme-toggle.tsx               # Dark/light toggle
│   └── ui/                            # shadcn components
├── lib/
│   ├── gold-data.ts                   # Data utilities
│   ├── providers.tsx                  # Theme provider
│   └── utils.ts                       # General utilities
├── public/                            # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── components.json                    # shadcn config
```

## 🚀 Quick Start

### Development

```bash
# Navigate to the app
cd /workspaces/antam-gold-price/nextjs-app

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📦 Dependencies

### Core
- `next`: ^16.1.1 - React framework
- `react`: ^19.0.0 - UI library
- `typescript`: ^5.7.3 - Type checking

### UI & Styling
- `@radix-ui/*`: Components foundation
- `shadcn-ui`: Pre-built components
- `tailwindcss`: ^4.0.0 - Utility CSS
- `lucide-react`: Icons library

### Features
- `recharts`: Interactive charts
- `next-themes`: Theme management

## 🎯 Key Features Explained

### Chart Functionality
- Dual Y-axis (left for prices, right for spread)
- Responsive to window size
- Dark theme aware colors
- Smooth line curves
- Hover tooltips with formatted values
- Legend at bottom
- No animation on initial load (for performance)

### Table Functionality
- Server-side sorting by date (descending)
- Client-side pagination
- Centered table headers
- Right-aligned numeric values
- Color-coded text (red/green/blue)
- Responsive horizontal scrolling
- Shows change indicators for price movements

### Pagination
- Smart page ellipsis (shows current page ± 1)
- Previous/Next buttons with disabled states
- Click to go to specific page
- 10 items per page

### Data Loading
- Fetches from API on component mount
- Processes raw timestamp data
- Combines buy and sell data
- Calculates spreads and percentages
- Filters by date range
- Memoized calculations for performance

## 🎨 Customization

### Change Theme Colors
Edit `app/globals.css`:
```css
@layer base {
  :root {
    --background: 0 0% 100%;      /* White background */
    --foreground: 0 0% 3.6%;      /* Dark text */
    --primary: 0 0% 9%;           /* Primary color */
    /* ... more variables ... */
  }
  
  .dark {
    --background: 0 0% 3.6%;      /* Dark background */
    --foreground: 0 0% 98%;       /* Light text */
    /* ... more variables ... */
  }
}
```

### Change Table Pagination
In `components/price-table.tsx`:
```typescript
const ITEMS_PER_PAGE = 10;  // Change this number
```

### Change Chart Colors
In `components/price-chart.tsx`:
```typescript
<Line
  yAxisId="left"
  type="monotone"
  dataKey="sell"
  stroke="#ef4444"  // Change color
  name="Harga Jual"
/>
```

### Add Time Range
In `app/page.tsx`:
```typescript
const daysMap: Record<DateRange, number | null> = {
  "7": 7,
  "30": 30,
  "180": 180,
  "365": 365,
  "all": null,
  "90": 90,  // Add this
};
```

Then add to select options:
```tsx
<SelectItem value="90">3 Bulan Terakhir</SelectItem>
```

## 🔄 Data Flow

```
antam_buy.json & antam_sell.json
    ↓
/api/gold-prices (route.ts)
    ↓
processRawData() - Convert timestamps
    ↓
combineData() - Merge & calculate spread
    ↓
Component State
    ↓
filterByDateRange() - User selection
    ↓
PriceChart & PriceTable
```

## 📱 Responsive Breakpoints

The app is fully responsive using Tailwind CSS breakpoints:
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Mobile-first design ensures great experience on all devices.

## ⚡ Performance Optimizations

1. **Code Splitting**
   - Route-based code splitting
   - Dynamic imports where needed

2. **Data Loading**
   - Single API call on mount
   - Memoized calculations
   - useCallback for event handlers

3. **Rendering**
   - Client components only where needed
   - Optimized re-renders with useMemo
   - No animations on initial load

4. **Bundle Size**
   - Tree-shaking of unused code
   - Tailwind CSS purging
   - Component lazy loading

## 🌐 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari 14+
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Environment Variables

No environment variables needed for basic functionality.

For Vercel deployment, you might want to add:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚢 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Next.js app"
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from Git
   - Select the repository
   - Configure project root as `nextjs-app/`

3. **Deploy**
   - Click "Deploy"
   - App will be live in ~2 minutes

## 🆘 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Port 3000 Already In Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Data Not Loading
- Check if `antam_buy.json` and `antam_sell.json` exist in parent directory
- Check browser console for API errors
- Verify file paths in `app/api/gold-prices/route.ts`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [TypeScript](https://www.typescriptlang.org)

## 📄 License

MIT - Feel free to use and modify!

## 🎉 Next Steps

1. Test the app locally: `npm run dev`
2. Customize colors and branding
3. Deploy to Vercel for production
4. Monitor analytics
5. Update data periodically

---

**Created with ❤️ for ANTAM Gold Price Tracking**
