"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wallet, Zap, Shield, Store, User, ChevronDown } from "lucide-react";
import { currentUser, notifications, formatCALL, getTierColor } from "@/data/mock";
import { useRole, Role } from "@/lib/role-context";

const roleConfig: Record<Role, { label: string; color: string; icon: typeof User }> = {
  user: { label: "User", color: "#16A34A", icon: User },
  sponsor: { label: "Sponsor", color: "#2563EB", icon: Store },
  super_admin: { label: "Admin", color: "#DC2626", icon: Shield },
};

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const { role, setRole } = useRole();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const rc = roleConfig[role];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Cric<span className="text-green-600">Call</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/markets" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Markets</Link>
          <Link href="/deals" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Deals</Link>
          <Link href="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leaderboard</Link>
          <Link href="/rewards" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Rewards</Link>
          {(role === "sponsor" || role === "super_admin") && (
            <Link href="/sponsor" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">Sponsor</Link>
          )}
          {role === "super_admin" && (
            <Link href="/admin" className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium">Admin</Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
              style={{ borderColor: rc.color + "30", backgroundColor: rc.color + "08", color: rc.color }}
            >
              <rc.icon className="w-3 h-3" />
              {rc.label}
              <ChevronDown className="w-3 h-3" />
            </motion.button>
            <AnimatePresence>
              {showRolePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-10 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 px-2">Demo Role Switcher</p>
                  </div>
                  {(Object.keys(roleConfig) as Role[]).map((r) => {
                    const cfg = roleConfig[r];
                    return (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setShowRolePicker(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${role === r ? "bg-slate-50" : ""}`}
                      >
                        <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                        <span style={{ color: role === r ? cfg.color : undefined }}>{cfg.label}</span>
                        {role === r && <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CALL Balance */}
          {currentUser.connected && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-mono font-bold text-green-700 tabular-nums">{formatCALL(currentUser.callBalance)}</span>
              <span className="text-xs text-green-500">CALL</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 border-b border-slate-50 ${!n.read ? "bg-green-50/50" : ""}`}>
                        <div className="flex gap-2">
                          <span className="text-lg">
                            {n.type === "winnings" && "\u{1F3C6}"}
                            {n.type === "reward" && "\u{1F4B0}"}
                            {n.type === "tier_up" && "\u2B50"}
                            {n.type === "loss" && "\u274C"}
                            {n.type === "deal_unlocked" && "\u{1F381}"}
                            {n.type === "sponsor" && "\u{1F4E2}"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white"
            >
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
}
