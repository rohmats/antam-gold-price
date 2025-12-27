"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatBoxProps {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "success" | "error" | "info";
}

const variantStyles = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function StatBox({
  label,
  value,
  subtext,
  variant = "default",
}: StatBoxProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variantStyles[variant]}`}>
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
