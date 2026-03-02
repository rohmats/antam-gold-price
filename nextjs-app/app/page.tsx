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
import { AlertCircle, CalendarClock, CircleDollarSign, HandCoins, MoveRightLeft } from "lucide-react";

type DateRange = "7" | "14" | "30" | "90" | "180" | "365" | "730" | "1825" | "3650" | "all" | "custom";

const daysMap: Record<DateRange, number | null> = {
  "7": 7,
  "14": 14,
  "30": 30,
  "90": 90,
  "180": 180,
  "365": 365,
  "730": 730,
  "1825": 1825,
  "3650": 3650,
  all: null,
  custom: null,
};

export default function Home() {
  const [data, setData] = useState<GoldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("180");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

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
  const filteredData = useMemo(() => {
    const rangeDays = dateRange === "custom" ? null : daysMap[dateRange];
    let base = filterByDateRange(data, rangeDays);

    if (dateRange === "custom") {
      if (fromDate) {
        const from = new Date(fromDate);
        base = base.filter((item) => item.date >= from);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        base = base.filter((item) => item.date <= to);
      }
    }
    return base;
  }, [data, dateRange, fromDate, toDate]);

  const applyPreset = (value: DateRange) => {
    setDateRange(value);

    if (value === "custom") {
      return;
    }

    const days = daysMap[value];
    if (days === null) {
      setFromDate("");
      setToDate("");
      return;
    }

    if (!data.length) {
      setFromDate("");
      setToDate("");
      return;
    }

    const latest = new Date(Math.max(...data.map((d) => d.date.getTime())));
    const start = new Date(latest);
    start.setDate(start.getDate() - (days - 1));

    setFromDate(start.toISOString().slice(0, 10));
    setToDate(latest.toISOString().slice(0, 10));
  };

  const rangeLabel = useMemo(() => {
    if (dateRange === "custom" && (fromDate || toDate)) {
      const fromText = fromDate || "..";
      const toText = toDate || "..";
      return `Custom: ${fromText} → ${toText}`;
    }

    const labelMap: Record<DateRange, string> = {
      "7": "7 Hari Terakhir",
      "14": "14 Hari Terakhir",
      "30": "30 Hari Terakhir",
      "90": "3 Bulan Terakhir",
      "180": "6 Bulan Terakhir",
      "365": "1 Tahun Terakhir",
      "730": "2 Tahun Terakhir",
      "1825": "5 Tahun Terakhir",
      "3650": "10 Tahun Terakhir",
      all: "Tampilkan Semua",
      custom: "Custom Range",
    };

    return labelMap[dateRange];
  }, [dateRange, fromDate, toDate]);

  const customSummary = useMemo(() => {
    if (fromDate || toDate) {
      const fromText = fromDate || "..";
      const toText = toDate || "..";
      return `${fromText} → ${toText}`;
    }
    return "Masukkan tanggal untuk mulai";
  }, [fromDate, toDate]);

  const rangeChange = useMemo(() => {
    if (filteredData.length < 2) return null;

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];

    const pct = (current: number, prev: number) =>
      prev > 0 ? (((current - prev) / prev) * 100) : null;

    return {
      sellPct: pct(last.amountSell, first.amountSell),
      buyPct: pct(last.amountBuy, first.amountBuy),
    };
  }, [filteredData]);

  const latestData = filteredData[filteredData.length - 1];
  const previousData =
    filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;

  const getDeltaInfo = (current: number, previous: number | null) => {
    if (previous === null || current === previous) {
      return {
        text: "Tidak berubah dari data sebelumnya",
        trend: "neutral" as const,
      };
    }

    const increased = current > previous;
    return {
      text: `${increased ? "Naik" : "Turun"} ${Math.abs(current - previous).toLocaleString("id-ID")}`,
      trend: increased ? ("up" as const) : ("down" as const),
    };
  };

  const sellDelta = latestData
    ? getDeltaInfo(latestData.amountSell, previousData ? previousData.amountSell : null)
    : null;

  const buyDelta = latestData
    ? getDeltaInfo(latestData.amountBuy, previousData ? previousData.amountBuy : null)
    : null;

  const spreadDelta = latestData
    ? getDeltaInfo(latestData.difference, previousData ? previousData.difference : null)
    : null;


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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8 space-y-5 md:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Harga Emas ANTAM
          </h1>
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
                  Logam Mulia - ANTAM
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <StatBox
              label="Harga Jual"
              value={formatCurrency(latestData.amountSell)}
              subtext={sellDelta?.text}
              trend={sellDelta?.trend}
              icon={<CircleDollarSign className="h-4 w-4" />}
              variant="error"
            />
            <StatBox
              label="Harga Beli"
              value={formatCurrency(latestData.amountBuy)}
              subtext={buyDelta?.text}
              trend={buyDelta?.trend}
              icon={<HandCoins className="h-4 w-4" />}
              variant="success"
            />
            <StatBox
              label="Spread"
              value={formatCurrency(latestData.difference)}
              subtext={spreadDelta ? `${latestData.percentSpread.toFixed(2)}% • ${spreadDelta.text}` : `${latestData.percentSpread.toFixed(2)}% dari harga jual`}
              trend={spreadDelta?.trend}
              icon={<MoveRightLeft className="h-4 w-4" />}
              variant="info"
            />
            <StatBox
              label="Tanggal Update"
              value={latestData.date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              subtext={`${latestData.date.toLocaleDateString("id-ID", {
                weekday: "long",
              })} • Data harian ANTAM`}
              trend="neutral"
              icon={<CalendarClock className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Chart Section */}
        <Card className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Grafik Harga</h2>
                {rangeChange && (
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2 py-1">
                      <span className="font-semibold text-foreground">Jual</span>
                      <span
                        className={
                          rangeChange.sellPct !== null && rangeChange.sellPct > 0
                            ? "text-green-600 dark:text-green-400"
                            : rangeChange.sellPct !== null && rangeChange.sellPct < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }
                      >
                        {rangeChange.sellPct !== null
                          ? `${rangeChange.sellPct > 0 ? "↑" : rangeChange.sellPct < 0 ? "↓" : "→"} ${Math.abs(rangeChange.sellPct).toFixed(2)}%`
                          : "n/a"}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2 py-1">
                      <span className="font-semibold text-foreground">Beli</span>
                      <span
                        className={
                          rangeChange.buyPct !== null && rangeChange.buyPct > 0
                            ? "text-green-600 dark:text-green-400"
                            : rangeChange.buyPct !== null && rangeChange.buyPct < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }
                      >
                        {rangeChange.buyPct !== null
                          ? `${rangeChange.buyPct > 0 ? "↑" : rangeChange.buyPct < 0 ? "↓" : "→"} ${Math.abs(rangeChange.buyPct).toFixed(2)}%`
                          : "n/a"}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={dateRange} onValueChange={(value) => applyPreset(value as DateRange)}>
                  <SelectTrigger className="h-10 w-full sm:w-48">
                    <SelectValue placeholder="Pilih rentang" aria-label={rangeLabel}>
                      {rangeLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Hari Terakhir</SelectItem>
                    <SelectItem value="14">14 Hari Terakhir</SelectItem>
                    <SelectItem value="30">30 Hari Terakhir</SelectItem>
                    <SelectItem value="90">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="180">6 Bulan Terakhir</SelectItem>
                    <SelectItem value="365">1 Tahun Terakhir</SelectItem>
                    <SelectItem value="730">2 Tahun Terakhir</SelectItem>
                    <SelectItem value="1825">5 Tahun Terakhir</SelectItem>
                    <SelectItem value="3650">10 Tahun Terakhir</SelectItem>
                    <SelectItem value="all">Tampilkan Semua</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setDateRange("180");
                  }}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Removed duplicate percentage badges below the chart header */}

            {dateRange === "custom" && (
              <fieldset className="rounded-lg border border-border/80 bg-muted/30 p-3 sm:p-4 space-y-3">
                <legend className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custom tanggal</legend>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">Isi salah satu atau kedua tanggal. Kosongkan untuk kembali ke preset.</div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    {customSummary}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="from-date">Dari</label>
                    <input
                      id="from-date"
                      type="date"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="to-date">Sampai</label>
                    <input
                      id="to-date"
                      type="date"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full rounded-md border border-dashed border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground">
                      Gunakan preset untuk cepat, atau isi tanggal untuk presisi.
                    </div>
                  </div>
                </div>
              </fieldset>
            )}
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
            Dibuat dengan ❤️ menggunakan Next.js dan Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
