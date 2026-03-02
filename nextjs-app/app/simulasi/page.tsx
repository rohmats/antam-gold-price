"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatBox } from "@/components/stat-box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GoldData,
  processRawData,
  combineData,
  formatCurrency,
} from "@/lib/gold-data";
import { AlertCircle, Trash2 } from "lucide-react";

interface BuybackResult {
  id: string;
  jumlahEmas: number;
  tanggalBeli: Date;
  hargaBeli: number;
  totalBeli: number;
  totalJual: number;
  keuntunganRugi: number;
  persentase: number;
}

export default function SimulasiPage() {
  const [data, setData] = useState<GoldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jumlahEmas, setJumlahEmas] = useState<string>("");
  const [tanggalBeli, setTanggalBeli] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [tanggalBuyback, setTanggalBuyback] = useState<string>("");
  const [results, setResults] = useState<BuybackResult[]>([]);

  const toISODate = (date: Date) => date.toISOString().split("T")[0];

  const findClosestData = (dateStr: string): GoldData | null => {
    if (data.length === 0) return null;

    const selectedDate = new Date(dateStr);
    selectedDate.setUTCHours(0, 0, 0, 0);

    let closestData = data[0];
    let minDiff = Math.abs(closestData.date.getTime() - selectedDate.getTime());

    for (const item of data) {
      const diff = Math.abs(item.date.getTime() - selectedDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestData = item;
      }
    }

    return closestData;
  };

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
        const latest = combined[combined.length - 1];
        if (latest) {
          setTanggalBuyback(toISODate(latest.date));
        }
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

  const latestData = data[data.length - 1];
  const selectedBuybackData = tanggalBuyback
    ? findClosestData(tanggalBuyback)
    : latestData ?? null;
  const minDate = data.length > 0 ? toISODate(data[0].date) : undefined;
  const maxDate = latestData ? toISODate(latestData.date) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jumlahEmas || parseFloat(jumlahEmas) <= 0) {
      setError("Masukkan jumlah emas yang valid");
      return;
    }

    const amount = parseFloat(jumlahEmas);
    const closestData = findClosestData(tanggalBeli);
    const buybackDataForCalculation = selectedBuybackData ?? latestData;

    if (!closestData || !buybackDataForCalculation) {
      setError("Data tidak tersedia");
      return;
    }

    const hargaBeli = closestData.amountSell;
    const totalBeli = amount * hargaBeli;
    const totalJual = amount * buybackDataForCalculation.amountBuy;
    const keuntunganRugi = totalJual - totalBeli;
    const persentase =
      totalBeli > 0 ? (keuntunganRugi / totalBeli) * 100 : 0;

    const newResult: BuybackResult = {
      id: Date.now().toString(),
      jumlahEmas: amount,
      tanggalBeli: closestData.date,
      hargaBeli,
      totalBeli,
      totalJual,
      keuntunganRugi,
      persentase,
    };

    setResults([...results, newResult]);
    setJumlahEmas("");
    setTanggalBeli(new Date().toISOString().split("T")[0]);
    setError(null);
  };

  const handleDelete = (id: string) => {
    setResults(results.filter((r) => r.id !== id));
  };

  const totalStats = results.reduce(
    (acc, r) => ({
      emas: acc.emas + r.jumlahEmas,
      beli: acc.beli + r.totalBeli,
      jual: acc.jual + r.totalJual,
      rugi: acc.rugi + r.keuntunganRugi,
    }),
    { emas: 0, beli: 0, jual: 0, rugi: 0 }
  );

  const totalPersentase =
    totalStats.beli > 0 ? (totalStats.rugi / totalStats.beli) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8 animate-pulse">
            <div className="h-10 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Simulasi Buyback</h1>
          <p className="text-muted-foreground">
            Hitung perkiraan keuntungan atau kerugian dari buyback emas Anda
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Price Info */}
        {selectedBuybackData && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="ml-2 text-green-900 dark:text-green-200">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px] md:items-end">
                <div className="rounded-md border border-green-200/80 bg-white/60 px-4 py-3 dark:border-green-800/80 dark:bg-green-900/30">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-300">
                    Harga Buyback
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {selectedBuybackData.date.toLocaleDateString("id-ID")}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-tight text-green-900 dark:text-green-100">
                    {formatCurrency(selectedBuybackData.amountBuy)}
                    <span className="ml-1 text-sm font-medium">per gram</span>
                  </p>
                </div>
                <div className="rounded-md border border-green-200/80 bg-white/60 px-4 py-3 dark:border-green-800/80 dark:bg-green-900/30">
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Buyback
                  </label>
                  <Input
                    type="date"
                    className="bg-background text-foreground w-full"
                    min={minDate}
                    max={maxDate}
                    value={tanggalBuyback}
                    onChange={(e) => setTanggalBuyback(e.target.value)}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Tambah Data Pembelian</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jumlah Emas (gram)
                </label>
                <Input
                  type="number"
                  placeholder="Contoh: 10.5"
                  value={jumlahEmas}
                  onChange={(e) => setJumlahEmas(e.target.value)}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tanggal Beli
                </label>
                <Input
                  type="date"
                  value={tanggalBeli}
                  onChange={(e) => setTanggalBeli(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Hitung Keuntungan/Rugi
            </Button>
          </form>
        </Card>

        {/* Results Summary */}
        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatBox
                label="Total Emas"
                value={`${totalStats.emas.toLocaleString("id-ID", { maximumFractionDigits: 2 })} g`}
              />
              <StatBox
                label="Total Pembelian"
                value={formatCurrency(totalStats.beli)}
              />
              <StatBox
                label="Total Penjualan"
                value={formatCurrency(totalStats.jual)}
              />
              <StatBox
                label="Total Keuntungan/Rugi"
                value={formatCurrency(totalStats.rugi)}
                subtext={`${totalPersentase.toFixed(2)}%`}
                variant={totalStats.rugi >= 0 ? "success" : "error"}
              />
            </div>

            {/* Results Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-center">Emas (g)</TableHead>
                      <TableHead className="text-center">Tanggal Beli</TableHead>
                      <TableHead className="text-right">Harga Beli/g</TableHead>
                      <TableHead className="text-right">Total Beli</TableHead>
                      <TableHead className="text-right">Total Jual</TableHead>
                      <TableHead className="text-right">Untung/Rugi</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow
                        key={result.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-center font-semibold">
                          {result.jumlahEmas.toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {result.tanggalBeli.toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(result.hargaBeli)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(result.totalBeli)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(result.totalJual)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span
                            className={
                              result.keuntunganRugi >= 0
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {formatCurrency(result.keuntunganRugi)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          <span
                            className={
                              result.persentase >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {result.persentase.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(result.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Button
              variant="outline"
              onClick={() => {
                setResults([]);
                setJumlahEmas("");
              }}
              className="w-full"
            >
              Reset Semua Data
            </Button>
          </>
        )}

        {/* Disclaimer */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-amber-950 dark:text-amber-200 mb-2">
            ⚠️ Disclaimer
          </h3>
          <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
            <li>
              • Perhitungan ini hanya bersifat simulasi dan estimasi berdasarkan data historis.
            </li>
            <li>
              • Belum memperhitungkan biaya transaksi, pajak, atau biaya lainnya.
            </li>
            <li>
              • Harga buyback dapat berubah sewaktu-waktu sesuai dengan kebijakan penyedia layanan.
            </li>
            <li>
              • Pastikan untuk memverifikasi harga terkini sebelum melakukan transaksi.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
