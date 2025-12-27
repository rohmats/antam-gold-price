"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PriceChart } from "@/components/price-chart";
import { PriceTable } from "@/components/price-table";
import { StatBox } from "@/components/stat-box";
import {
  GoldData,
  processRawData,
  combineData,
  filterByDateRange,
  formatCurrency,
} from "@/lib/gold-data";
import { AlertCircle } from "lucide-react";

type DateRange = "7" | "30" | "180" | "365" | "all";

export default function Home() {
  const [data, setData] = useState<GoldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("365");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/gold-prices");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();

        const buyData = processRawData(result.buy);
        const sellData = processRawData(result.sell);
        const combined = combineData(sellData, buyData);

        setData(combined);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const daysMap: Record<DateRange, number | null> = {
    "7": 7,
    "30": 30,
    "180": 180,
    "365": 365,
    all: null,
  };

  const filteredData = useMemo(() => {
    return filterByDateRange(data, daysMap[dateRange]);
  }, [data, dateRange]);

  const latestData = filteredData[filteredData.length - 1];
  const previousData =
    filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-8 animate-pulse">
            <div className="h-10 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Harga Emas Antam</h1>
          <p className="text-muted-foreground">
            Pantau harga jual, beli, dan spread emas ANTAM secara real-time
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="ml-2 text-blue-900 dark:text-blue-200">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <span className="flex items-center gap-1.5">
                <span className="font-medium">Sumber data:</span>
                <a
                  href="https://logammulia.com"
                  className="underline font-semibold hover:no-underline inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Logam Mulia - Antam
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </span>
              <span className="hidden md:inline text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">Terakhir diperbarui:</span>
                <span className="font-semibold">
                  {latestData?.date.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatBox
              label="Harga Jual"
              value={formatCurrency(latestData.amountSell)}
              subtext={
                previousData &&
                latestData.amountSell !== previousData.amountSell
                  ? `${latestData.amountSell > previousData.amountSell ? "↑" : "↓"} ${Math.abs(latestData.amountSell - previousData.amountSell).toLocaleString("id-ID")}`
                  : "No change"
              }
              variant="error"
            />
            <StatBox
              label="Harga Beli"
              value={formatCurrency(latestData.amountBuy)}
              subtext={
                previousData &&
                latestData.amountBuy !== previousData.amountBuy
                  ? `${latestData.amountBuy > previousData.amountBuy ? "↑" : "↓"} ${Math.abs(latestData.amountBuy - previousData.amountBuy).toLocaleString("id-ID")}`
                  : "No change"
              }
              variant="success"
            />
            <StatBox
              label="Spread"
              value={formatCurrency(latestData.difference)}
              subtext={`${latestData.percentSpread.toFixed(2)}% dari harga jual`}
              variant="info"
            />
            <StatBox
              label="Tanggal Update"
              value={latestData.date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
              subtext={latestData.date.toLocaleDateString("id-ID", {
                weekday: "long",
              })}
            />
          </div>
        )}

        {/* Chart Section */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Grafik Harga</h2>
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Hari Terakhir</SelectItem>
                <SelectItem value="30">30 Hari Terakhir</SelectItem>
                <SelectItem value="180">6 Bulan Terakhir</SelectItem>
                <SelectItem value="365">1 Tahun Terakhir</SelectItem>
                <SelectItem value="all">Tampilkan Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredData.length > 0 ? (
            <PriceChart data={filteredData} />
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Tidak ada data untuk rentang waktu ini
            </div>
          )}
        </Card>

        {/* Table Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Data Detail</h2>
          {filteredData.length > 0 ? (
            <PriceTable data={filteredData} />
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Tidak ada data untuk rentang waktu ini
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground space-y-2">
          <p>
            💡 Gunakan halaman{" "}
            <a href="/simulasi" className="underline hover:no-underline">
              Simulasi Buyback
            </a>{" "}
            untuk menghitung keuntungan atau kerugian dari buyback emas Anda
          </p>
          <p className="text-xs">
            © 2025 Harga Emas ANTAM • Data dari Logam Mulia
          </p>
        </div>
      </div>
    </div>
  );
}
