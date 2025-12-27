"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { GoldData, formatCurrency, formatNumber } from "@/lib/gold-data";

interface PriceTableProps {
  data: GoldData[];
}

const ITEMS_PER_PAGE = 10;

export function PriceTable({ data }: PriceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-center font-semibold">
                  Tanggal
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Harga Jual
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Perubahan
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Harga Beli
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Perubahan
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Spread
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Perubahan
                </TableHead>
                <TableHead className="text-right font-semibold">
                  %Spread
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow
                  key={item.date.getTime()}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="text-center text-sm font-medium">
                    {item.date.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      {formatCurrency(item.amountSell)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {item.amountSellDiff !== undefined &&
                    item.amountSellDiff !== 0 ? (
                      <span
                        className={
                          item.amountSellDiff > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      >
                        {item.amountSellDiff > 0 ? "+" : ""}
                        {formatNumber(item.amountSellDiff)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(item.amountBuy)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {item.amountBuyDiff !== undefined &&
                    item.amountBuyDiff !== 0 ? (
                      <span
                        className={
                          item.amountBuyDiff > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      >
                        {item.amountBuyDiff > 0 ? "+" : ""}
                        {formatNumber(item.amountBuyDiff)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {formatCurrency(item.difference)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {item.differenceDiff !== undefined &&
                    item.differenceDiff !== 0 ? (
                      <span
                        className={
                          item.differenceDiff > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      >
                        {item.differenceDiff > 0 ? "+" : ""}
                        {formatNumber(item.differenceDiff)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">
                    {formatNumber(item.percentSpread)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
