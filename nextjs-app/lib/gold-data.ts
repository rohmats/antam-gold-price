export interface GoldPrice {
  date: Date;
  amount: number;
}

export interface GoldData {
  date: Date;
  amountSell: number;
  amountBuy: number;
  difference: number;
  percentSpread: number;
  amountSellDiff?: number;
  amountBuyDiff?: number;
  differenceDiff?: number;
}

export function processRawData(rawData: [number, number][]): GoldPrice[] {
  return rawData.map(([timestamp, amount]) => {
    const ts = timestamp > 10 ** 10 ? timestamp / 1000 : timestamp;
    return {
      date: new Date(ts * 1000),
      amount,
    };
  });
}

export function combineData(
  sellData: GoldPrice[],
  buyData: GoldPrice[]
): GoldData[] {
  const dataMap = new Map<string, GoldData>();

  // Add sell data
  sellData.forEach((item) => {
    const dateKey = item.date.toISOString().split("T")[0];
    dataMap.set(dateKey, {
      date: item.date,
      amountSell: item.amount,
      amountBuy: 0,
      difference: 0,
      percentSpread: 0,
    });
  });

  // Add buy data and calculate differences
  buyData.forEach((item) => {
    const dateKey = item.date.toISOString().split("T")[0];
    const existing = dataMap.get(dateKey);
    if (existing) {
      existing.amountBuy = item.amount;
    } else {
      dataMap.set(dateKey, {
        date: item.date,
        amountSell: 0,
        amountBuy: item.amount,
        difference: 0,
        percentSpread: 0,
      });
    }
  });

  // Calculate spread and percentages
  const sorted = Array.from(dataMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  sorted.forEach((item, index) => {
    item.difference = item.amountSell - item.amountBuy;
    item.percentSpread =
      item.amountSell > 0 ? (item.difference / item.amountSell) * 100 : 0;

    if (index > 0) {
      item.amountSellDiff = item.amountSell - sorted[index - 1].amountSell;
      item.amountBuyDiff = item.amountBuy - sorted[index - 1].amountBuy;
      item.differenceDiff = item.difference - sorted[index - 1].difference;
    }
  });

  return sorted;
}

export function filterByDateRange(
  data: GoldData[],
  days: number | null
): GoldData[] {
  if (days === null) return data;

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return data.filter((item) => item.date >= cutoff);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
