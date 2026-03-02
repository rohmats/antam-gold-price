"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatBoxProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "error" | "info";
  valueClassName?: string;
  shrinkLongValue?: boolean;
  singleLineValue?: boolean;
}

const variantStyles = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

const trendStyles = {
  up: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  down: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
  neutral: "border-border/80 bg-muted/50 text-muted-foreground",
};

export function StatBox({
  label,
  value,
  subtext,
  icon,
  trend = "neutral",
  variant = "default",
  valueClassName,
  shrinkLongValue = false,
  singleLineValue = false,
}: StatBoxProps) {
  const compactValue = value.replace(/\s+/g, "");
  const autoSizeClass = !shrinkLongValue
    ? ""
    : compactValue.length >= 19
      ? "text-[clamp(0.72rem,1.2vw,0.95rem)]"
      : compactValue.length >= 15
        ? "text-[clamp(0.82rem,1.35vw,1.05rem)]"
        : "";

  return (
    <Card className="h-full gap-2 border-border/70 bg-card/80 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:py-5">
      <CardHeader className="gap-1 px-4 pb-0 sm:px-5">
        <CardTitle className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{label}</span>
          {icon ? (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-foreground/80">
              {icon}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 px-4 sm:px-5">
        <div
          className={`w-full min-w-0 text-[clamp(1.05rem,2.3vw,1.55rem)] font-bold leading-tight tracking-tight ${variantStyles[variant]} ${singleLineValue ? "whitespace-nowrap" : "break-words"} ${autoSizeClass} ${valueClassName ?? ""}`}
        >
          {value}
        </div>
        {subtext && (
          <span className={`inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium leading-snug ${trendStyles[trend]}`}>
            {subtext}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
