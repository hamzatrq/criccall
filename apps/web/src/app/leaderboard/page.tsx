"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatCALL, getTierLabel, getTierColor } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useCallBalance, formatCallBalance } from "@/hooks/use-contracts";
import { useLeaderboard } from "@/hooks/use-api";
import {
  Crown,
  TrendingUp,
  MapPin,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const rankEmojis: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [showReferralBanner, setShowReferralBanner] = useState(false);
  const limit = 20;
  const { data: leaderboardData, isLoading } = useLeaderboard(page, limit);

  const entries = leaderboardData?.data || leaderboardData || [];
  const meta = leaderboardData?.meta || leaderboardData?.pagination;
  const totalPages = meta?.totalPages || meta?.lastPage || 1;

  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visually
  const topThree = entries.slice(0, 3);

  const { data: onChainBal } = useCallBalance();
  const callBalance = onChainBal
    ? Math.floor(Number(formatCallBalance(onChainBal as bigint)))
    : Number(user?.cachedCallBalance || 0);
  const tier = user?.tier || "new_fan";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Header section */}
      <div className="bg-[#14532d] pt-8 pb-16 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-7 h-7 text-amber-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">
                Leaderboard
              </h1>
            </div>
            <p className="text-green-100/70 text-sm">
              Ranked by CALL balance. More CALL = better predictor.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 -mt-10">
        {/* Your Position Card */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-5 rounded-2xl border border-emerald-200 bg-green-50 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {(user.displayName || "U").slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {user.displayName || "You"}
                  </p>
                  <p
                    className="text-[11px] uppercase tracking-wider font-semibold"
                    style={{ color: getTierColor(tier) }}
                  >
                    {getTierLabel(tier)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg text-emerald-700">
                  {formatCALL(callBalance)}{" "}
                  <span className="text-emerald-500 text-sm">CALL</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-semibold">
              No rankings yet
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Start predicting to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 3 && page === 1 && (
              <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                {podiumOrder.map((idx, i) => {
                  const e = topThree[idx];
                  if (!e) return null;
                  const isFirst = idx === 0;
                  const heights = ["pt-6", "pt-0", "pt-8"]; // 2nd, 1st, 3rd
                  const entryTier = e.tier || "new_fan";
                  const entryBalance = Number(e.callBalance || e.cachedCallBalance || 0);

                  return (
                    <motion.div
                      key={e.address || e.walletAddress || idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className={`relative rounded-2xl border text-center p-4 pb-5 ${heights[i]} ${
                        isFirst
                          ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-lg shadow-amber-100/50"
                          : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      {isFirst && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2"
                        >
                          <Crown className="w-8 h-8 text-amber-500 drop-shadow-md" />
                        </motion.div>
                      )}

                      <span className="text-2xl block mb-2">
                        {rankEmojis[idx + 1]}
                      </span>

                      <div
                        className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-2 shadow-inner"
                        style={{
                          background: `linear-gradient(135deg, ${getTierColor(entryTier)}, ${getTierColor(entryTier)}88)`,
                          color: "white",
                        }}
                      >
                        {(e.displayName || "??").slice(0, 2).toUpperCase()}
                      </div>

                      <p className="text-sm font-bold truncate text-slate-900">
                        {e.displayName || "Anonymous"}
                      </p>
                      {e.location && (
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {e.location}
                        </p>
                      )}
                      <p
                        className={`font-mono font-black text-lg mt-2 ${
                          isFirst ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {formatCALL(entryBalance)}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                        CALL
                      </p>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider mt-1"
                        style={{ color: getTierColor(entryTier) }}
                      >
                        {getTierLabel(entryTier)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Main content area with list + promo card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Full Ranked List */}
              <div className="lg:col-span-2 space-y-2">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Rankings
                </h2>
                {entries.map((entry: any, i: number) => {
                  const rank = entry.rank || (page - 1) * limit + i + 1;
                  const entryTier = entry.tier || "new_fan";
                  const entryBalance = Number(entry.callBalance || entry.cachedCallBalance || 0);
                  const isCurrentUser =
                    user?.walletAddress &&
                    (entry.walletAddress === user.walletAddress ||
                      entry.address === user.walletAddress);
                  const maxBalance = Number(entries[0]?.callBalance || entries[0]?.cachedCallBalance || 1);

                  return (
                    <motion.div
                      key={entry.address || entry.walletAddress || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      whileHover={{ x: 4, backgroundColor: "#f0fdf4" }}
                      className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm cursor-pointer transition-colors ${
                        isCurrentUser
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center shrink-0">
                        {rankEmojis[rank] ? (
                          <span className="text-xl">{rankEmojis[rank]}</span>
                        ) : (
                          <span className="text-sm font-bold text-slate-400 font-mono">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar with tier gradient */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${getTierColor(entryTier)}, ${getTierColor(entryTier)}66)`,
                          color: "white",
                        }}
                      >
                        {(entry.displayName || "??").slice(0, 2).toUpperCase()}
                      </div>

                      {/* Name + location */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-slate-900">
                          {entry.displayName || "Anonymous"}
                          {isCurrentUser && (
                            <span className="text-emerald-600 text-xs ml-1">(You)</span>
                          )}
                        </p>
                        {entry.location && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {entry.location}
                          </p>
                        )}
                      </div>

                      {/* CALL balance */}
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-sm tabular-nums text-slate-900">
                          {formatCALL(entryBalance)}
                        </p>
                        <p className="text-[10px] text-slate-400">CALL</p>
                      </div>

                      {/* Win rate */}
                      {entry.winRate !== undefined && (
                        <div className="text-right shrink-0 w-16">
                          <p className="text-sm font-mono text-emerald-600 font-semibold tabular-nums">
                            {entry.winRate}%
                          </p>
                          <p className="text-[10px] text-slate-400">Win Rate</p>
                        </div>
                      )}

                      {/* Progress bar (desktop) */}
                      <div className="hidden md:block w-20 shrink-0">
                        <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: getTierColor(entryTier) }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(entryBalance / maxBalance) * 100}%`,
                            }}
                            transition={{ delay: 0.4 + i * 0.04, duration: 0.6 }}
                          />
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden md:block" />
                    </motion.div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <span className="text-sm text-slate-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Refer a Friend Promotional Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-green-800 to-green-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden sticky top-24"
                >
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <h4 className="text-2xl font-black mb-2 leading-tight">
                      Refer a Friend, Earn Bonus PKR!
                    </h4>
                    <p className="text-green-100/70 text-sm mb-6 leading-relaxed">
                      Invite your cricket circle to join CricCall and earn
                      Shariah-compliant rewards for every successful signup.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowReferralBanner(true);
                        setTimeout(() => setShowReferralBanner(false), 3000);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-green-950 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wide transition-colors shadow-md"
                    >
                      Invite Now
                    </motion.button>
                    {showReferralBanner && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-xs text-amber-300 bg-green-900/50 rounded-lg px-3 py-2 text-center"
                      >
                        Coming soon! Referral system launching after PSL 2026.
                      </motion.p>
                    )}
                  </div>

                  {/* Decorative background element */}
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Trophy className="w-40 h-40 -rotate-12" />
                  </div>

                  {/* Stats below */}
                  <div className="relative z-10 mt-8 pt-6 border-t border-green-700/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-black text-amber-400">
                          {meta?.total != null ? formatCALL(meta.total) : "\u2014"}
                        </p>
                        <p className="text-[11px] text-green-100/50 uppercase tracking-wider">
                          Total Users
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-amber-400">
                          18
                        </p>
                        <p className="text-[11px] text-green-100/50 uppercase tracking-wider">
                          Live Markets
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
