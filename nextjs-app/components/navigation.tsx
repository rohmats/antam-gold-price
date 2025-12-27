"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Harga Emas",
      active: pathname === "/",
    },
    {
      href: "/simulasi",
      label: "Simulasi Buyback",
      active: pathname === "/simulasi",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-bold text-lg">💰 ANTAM Gold</div>
          <div className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  route.active
                    ? "text-foreground border-b-2 border-primary pb-4"
                    : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <div className="flex gap-4 px-4 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors flex-1 py-2 px-2 rounded",
                route.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
