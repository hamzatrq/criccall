"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Bell, Shield, Store, User, ChevronDown } from "lucide-react";
import { currentUser, notifications, formatCALL } from "@/data/mock";
import { useRole, Role } from "@/lib/role-context";

const roleConfig: Record<Role, { label: string; color: string; icon: typeof User }> = {
  user: { label: "User", color: "#4ade80", icon: User },
  sponsor: { label: "Sponsor", color: "#60a5fa", icon: Store },
  super_admin: { label: "Admin", color: "#f87171", icon: Shield },
};

const navLinks = [
  { href: "/markets", label: "Markets" },
  { href: "/deals", label: "Deals" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/rewards", label: "Rewards" },
];

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const { role, setRole } = useRole();
  const pathname = usePathname();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const rc = roleConfig[role];

  return (
    <header className="bg-[#14532d] sticky top-0 z-50 border-b border-emerald-800 shadow-lg">
      <div className="flex justify-between items-center px-6 py-3 w-full max-w-7xl mx-auto">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="CricCall" width={36} height={36} className="rounded-lg" />
            <span className="text-2xl font-black text-white tracking-tight">CricCall</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors pb-1 ${
                    isActive
                      ? "text-white font-bold border-b-2 border-amber-500"
                      : "text-emerald-100 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {(role === "sponsor" || role === "super_admin") && (
              <Link
                href="/sponsor"
                className={`transition-colors pb-1 ${
                  pathname.startsWith("/sponsor")
                    ? "text-white font-bold border-b-2 border-blue-400"
                    : "text-blue-300 hover:text-white"
                }`}
              >
                Sponsor
              </Link>
            )}
            {role === "super_admin" && (
              <Link
                href="/admin"
                className={`transition-colors pb-1 ${
                  pathname.startsWith("/admin")
                    ? "text-white font-bold border-b-2 border-red-400"
                    : "text-red-300 hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Role + Balance + Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-600/50 text-[11px] font-bold text-emerald-200 hover:bg-emerald-800/50 transition-colors"
            >
              <rc.icon className="w-3 h-3" />
              {rc.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showRolePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-9 w-40 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
                >
                  <div className="p-1.5 border-b border-slate-100">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 px-2">Demo Role</p>
                  </div>
                  {(Object.keys(roleConfig) as Role[]).map((r) => {
                    const cfg = roleConfig[r];
                    return (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setShowRolePicker(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 ${role === r ? "bg-slate-50 font-medium" : ""}`}
                      >
                        <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        {cfg.label}
                        {role === r && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Balance Pill */}
          {currentUser.connected && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-800/50 px-4 py-1.5 rounded-full font-bold border border-emerald-700">
              <span className="text-amber-400 text-sm">PKR 2,500</span>
              <span className="text-xs text-emerald-400/40">|</span>
              <span className="text-sm text-white">{formatCALL(currentUser.callBalance)} CALL</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-emerald-100 hover:bg-emerald-800 p-2 rounded-md transition-all active:scale-95"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-11 w-72 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-2.5 border-b border-slate-50 ${!n.read ? "bg-green-50/50" : ""}`}>
                        <div className="flex gap-2">
                          <span className="text-sm">
                            {n.type === "winnings" && "\u{1F3C6}"}
                            {n.type === "reward" && "\u{1F4B0}"}
                            {n.type === "tier_up" && "\u2B50"}
                            {n.type === "loss" && "\u274C"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{n.body}</p>
                          </div>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
