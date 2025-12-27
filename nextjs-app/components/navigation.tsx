"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GiGoldBar } from "react-icons/gi";
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
          <Link href="/" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all">
              <GiGoldBar className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Logam Mulia</span>
              <span className="text-xs font-medium text-muted-foreground">Harga Emas ANTAM</span>
            </div>
          </Link>
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
