"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  TooltipProps,
} from "recharts";
import { GoldData, formatCurrency } from "@/lib/gold-data";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

interface PriceChartProps {
  data: GoldData[];
}

const chartConfig = {
  sell: {
    label: "Harga Jual",
    color: "hsl(0, 84%, 60%)",
  },
  buy: {
    label: "Harga Beli",
    color: "hsl(142, 71%, 45%)",
  },
  spread: {
    label: "Spread",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const sell = payload.find((p) => p.dataKey === "sell");
  const buy = payload.find((p) => p.dataKey === "buy");
  const spread = payload.find((p) => p.dataKey === "spread");
  
  // Use fullDate from payload if available
  const fullDate = (payload[0]?.payload as any)?.fullDate || label;

  return (
    <Card className="border shadow-lg p-3 min-w-[200px]">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground border-b pb-1 mb-2">
          {fullDate}
        </p>
        
        {sell && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartConfig.sell.color }} />
              <span className="text-xs font-medium">Harga Jual</span>
            </div>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(sell.value as number)}
            </span>
          </div>
        )}
        
        {buy && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartConfig.buy.color }} />
              <span className="text-xs font-medium">Harga Beli</span>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(buy.value as number)}
            </span>
          </div>
        )}
        
        {spread && (
          <div className="flex items-center justify-between gap-3 border-t pt-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartConfig.spread.color }} />
              <span className="text-xs font-medium">Spread</span>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(spread.value as number)}
            </span>
          </div>
        )}
        
        {sell && buy && (
          <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs pt-1 border-t mt-2">
            <span>Persentase</span>
            <span className="font-medium">
              {(((sell.value as number) - (buy.value as number)) / (sell.value as number) * 100).toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export function PriceChart({ data }: PriceChartProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-96 bg-muted animate-pulse rounded" />;
  }

  const chartData = data.map((item) => ({
    date: item.date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
    fullDate: item.date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    sell: item.amountSell,
    buy: item.amountBuy,
    spread: item.difference,
  }));

  const isDark = theme === "dark";

  // Calculate min/max for Y-axis domains
  const priceValues = data.flatMap((item) => [item.amountSell, item.amountBuy]);
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice;
  const pricePadding = priceRange * 0.1; // 10% padding

  const spreadValues = data.map((item) => item.difference);
  const minSpread = Math.min(...spreadValues);
  const maxSpread = Math.max(...spreadValues);
  const spreadRange = maxSpread - minSpread;
  const spreadPadding = spreadRange * 0.1; // 10% padding

  // Calculate tick interval for X-axis to avoid dense labels
  const dataLength = chartData.length;
  let tickInterval = 0;
  
  if (dataLength > 365) {
    tickInterval = Math.floor(dataLength / 12); // ~12 labels for very long periods
  } else if (dataLength > 180) {
    tickInterval = Math.floor(dataLength / 10); // ~10 labels for 6+ months
  } else if (dataLength > 90) {
    tickInterval = Math.floor(dataLength / 8); // ~8 labels for 3+ months
  } else if (dataLength > 30) {
    tickInterval = Math.floor(dataLength / 6); // ~6 labels for 1+ month
  } else if (dataLength > 7) {
    tickInterval = Math.floor(dataLength / 5); // ~5 labels for 1+ week
  } else {
    tickInterval = 1; // Show all labels for very short periods
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ComposedChart data={chartData}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
          interval={tickInterval}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
          domain={[minPrice - pricePadding, maxPrice + pricePadding]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}rb`}
          domain={[minSpread - spreadPadding, maxSpread + spreadPadding]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="line"
        />
        <defs>
          <linearGradient id="fillSell" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-sell)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-sell)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillBuy" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-buy)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-buy)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="sell"
          stroke="var(--color-sell)"
          fill="url(#fillSell)"
          strokeWidth={2}
          dot={false}
          name="Harga Jual"
          isAnimationActive={false}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="buy"
          stroke="var(--color-buy)"
          fill="url(#fillBuy)"
          strokeWidth={2}
          dot={false}
          name="Harga Beli"
          isAnimationActive={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="spread"
          stroke="var(--color-spread)"
          strokeWidth={2}
          dot={false}
          name="Spread"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
