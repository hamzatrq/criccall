"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Tag, Gift, User, Store, Shield } from "lucide-react";
import { useRole } from "@/lib/role-context";

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useRole();

  const baseTabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/markets", label: "Markets", icon: BarChart3 },
    { href: "/deals", label: "Deals", icon: Tag },
    { href: "/rewards", label: "Rewards", icon: Gift },
    { href: "/profile", label: "Profile", icon: User },
  ];
  const sponsorTabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/markets", label: "Markets", icon: BarChart3 },
    { href: "/sponsor", label: "Sponsor", icon: Store },
    { href: "/deals", label: "Deals", icon: Tag },
    { href: "/profile", label: "Profile", icon: User },
  ];
  const adminTabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/markets", label: "Markets", icon: BarChart3 },
    { href: "/admin", label: "Admin", icon: Shield },
    { href: "/sponsor", label: "Sponsor", icon: Store },
    { href: "/profile", label: "Profile", icon: User },
  ];
  const tabs = role === "super_admin" ? adminTabs : role === "sponsor" ? sponsorTabs : baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-200 bg-white">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center gap-0.5 w-14 h-full">
              <Icon className={`w-5 h-5 ${isActive ? "text-green-700" : "text-slate-400"}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-green-700" : "text-slate-400"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
