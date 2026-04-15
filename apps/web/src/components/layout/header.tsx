"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, User, Wallet, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCallBalance, formatCallBalance } from "@/hooks/use-contracts";
import { useUnreadCount, useNotifications } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navLinks = [
  { href: "/markets", label: "Markets" },
  { href: "/deals", label: "Deals" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/rewards", label: "Rewards" },
];

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;
  const { data: notificationsData } = useNotifications();
  const notifications: any[] = notificationsData?.data ?? notificationsData ?? [];
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "winnings": return "\uD83C\uDFC6";
      case "reward": return "\uD83D\uDCB0";
      case "tier_up": return "\u2B50";
      case "loss": return "\u274C";
      default: return "\uD83D\uDD14";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  const { isConnected, address } = useAccount();
  const { data: onChainBalance } = useCallBalance();
  const userRole = user?.role;
  const wasConnected = useRef(false);

  // Auto-trigger SIWE login only when wallet freshly connects (false → true)
  // Prevents re-login race condition during logout
  useEffect(() => {
    if (isConnected && !wasConnected.current && address && !isAuthenticated && !isLoading) {
      login().catch((e) => console.error("SIWE login failed:", e));
    }
    wasConnected.current = isConnected;
  }, [isConnected, address, isAuthenticated, isLoading, login]);

  return (
    <header className="bg-[#14532d] sticky top-0 z-50 border-b border-emerald-800 shadow-lg">
      <div className="flex justify-between items-center px-6 py-3 w-full max-w-7xl mx-auto">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="CricCall" width={36} height={36} className="rounded-lg" />
            <span className="text-2xl text-white tracking-tight font-[family-name:var(--font-brand)]">CRICALL</span>
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
            {(userRole === "sponsor" || userRole === "super_admin") && (
              <Link href="/sponsor" className={`transition-colors pb-1 ${pathname.startsWith("/sponsor") ? "text-white font-bold border-b-2 border-blue-400" : "text-blue-300 hover:text-white"}`}>
                Sponsor
              </Link>
            )}
            {userRole === "super_admin" && (
              <Link href="/admin" className={`transition-colors pb-1 ${pathname.startsWith("/admin") ? "text-white font-bold border-b-2 border-red-400" : "text-red-300 hover:text-white"}`}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* CALL Balance */}
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-800/50 px-4 py-1.5 rounded-full font-bold border border-emerald-700">
              <span className="text-sm text-white">
                {onChainBalance !== undefined
                  ? `${Number(formatCallBalance(onChainBalance as bigint)).toLocaleString()} CALL`
                  : `${Number(user.cachedCallBalance || 0).toLocaleString()} CALL`}
              </span>
            </div>
          )}

          {/* Notifications */}
          {isAuthenticated && (
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
                    className="absolute right-0 top-11 w-80 max-h-96 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.readAt ? "bg-emerald-50/40" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">{getNotificationIcon(n.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
                                  {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.body}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Connect / Profile */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white hover:opacity-90 transition-opacity"
              >
                {user.displayName?.slice(0, 2)?.toUpperCase() || user.walletAddress.slice(2, 4).toUpperCase()}
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-12 w-52 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || "User"}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{user.walletAddress}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile
                    </Link>
                    <Link
                      href="/rewards"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-slate-400" />
                      My Rewards
                    </Link>
                    <div className="border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openConnectModal}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4ade80] text-emerald-950 font-bold rounded-lg text-sm"
                >
                  <Wallet className="w-4 h-4" />
                  {isLoading ? "..." : "Connect Wallet"}
                </motion.button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </header>
  );
}
