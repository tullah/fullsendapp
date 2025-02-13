"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Players", href: "/players" },
  { label: "Review Disputes", href: "/admin/disputes" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 justify-between">
          {/* Left side */}
          <div className="flex">
            <Link
              href="/"
              className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
            >
              🥏 FullSend
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/players"
              className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              Players
            </Link>
            <Link
              href="/admin/disputes"
              className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              Review Disputes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 