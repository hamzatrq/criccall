"use client";

import { motion } from "framer-motion";
import {
  leaderboard,
  formatCALL,
  getTierLabel,
  getTierColor,
  currentUser,
} from "@/data/mock";
import {
  Crown,
  TrendingUp,
  MapPin,
  Users,
  Trophy,
  ChevronRight,
} from "lucide-react";

const rankEmojis: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

const mockLocations: Record<string, string> = {
  CricketKing99: "Lahore",
  BabarFanatic: "Karachi",
  LahorePredictor: "Lahore",
  KarachiKid: "Karachi",
  PeshawarPride: "Peshawar",
  SixerMachine: "Islamabad",
  BowlerBoss: "Quetta",
  MatchDay_Pro: "Rawalpindi",
  WicketWizard: "Faisalabad",
  CenturyMaker: "Multan",
};

export default function LeaderboardPage() {
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visually

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
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-green-50">
                  42
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {currentUser.displayName}
                </p>
                <p
                  className="text-[11px] uppercase tracking-wider font-semibold"
                  style={{ color: getTierColor(currentUser.tier) }}
                >
                  {getTierLabel(currentUser.tier)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-lg text-emerald-700">
                {formatCALL(currentUser.callBalance)}{" "}
                <span className="text-emerald-500 text-sm">CALL</span>
              </p>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-slate-500">Rank #42</span>
                <span className="text-xs text-emerald-600 font-mono font-semibold">
                  {currentUser.winRate}% WR
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
          {podiumOrder.map((idx, i) => {
            const e = leaderboard[idx];
            const isFirst = idx === 0;
            const heights = ["pt-6", "pt-0", "pt-8"]; // 2nd, 1st, 3rd

            return (
              <motion.div
                key={e.address}
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
                    background: `linear-gradient(135deg, ${getTierColor(e.tier)}, ${getTierColor(e.tier)}88)`,
                    color: "white",
                  }}
                >
                  {e.displayName.slice(0, 2).toUpperCase()}
                </div>

                <p className="text-sm font-bold truncate text-slate-900">
                  {e.displayName}
                </p>
                <p className="text-xs text-slate-400 flex items-center justify-center gap-0.5 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {mockLocations[e.displayName] || "Pakistan"}
                </p>
                <p
                  className={`font-mono font-black text-lg mt-2 ${
                    isFirst ? "text-amber-600" : "text-slate-900"
                  }`}
                >
                  {formatCALL(e.callBalance)}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  CALL
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mt-1"
                  style={{ color: getTierColor(e.tier) }}
                >
                  {getTierLabel(e.tier)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Main content area with list + promo card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Full Ranked List */}
          <div className="lg:col-span-2 space-y-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Rankings
            </h2>
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                whileHover={{ x: 4, backgroundColor: "#f0fdf4" }}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {rankEmojis[entry.rank] ? (
                    <span className="text-xl">{rankEmojis[entry.rank]}</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-400 font-mono">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar with tier gradient */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${getTierColor(entry.tier)}, ${getTierColor(entry.tier)}66)`,
                    color: "white",
                  }}
                >
                  {entry.displayName.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + location */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-slate-900">
                    {entry.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {mockLocations[entry.displayName] || "Pakistan"}
                  </p>
                </div>

                {/* CALL balance */}
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-sm tabular-nums text-slate-900">
                    {formatCALL(entry.callBalance)}
                  </p>
                  <p className="text-[10px] text-slate-400">CALL</p>
                </div>

                {/* Win rate */}
                <div className="text-right shrink-0 w-16">
                  <p className="text-sm font-mono text-emerald-600 font-semibold tabular-nums">
                    {entry.winRate}%
                  </p>
                  <p className="text-[10px] text-slate-400">Win Rate</p>
                </div>

                {/* Progress bar (desktop) */}
                <div className="hidden md:block w-20 shrink-0">
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getTierColor(entry.tier) }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(entry.callBalance / leaderboard[0].callBalance) * 100}%`,
                      }}
                      transition={{ delay: 0.4 + i * 0.04, duration: 0.6 }}
                    />
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden md:block" />
              </motion.div>
            ))}
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
                  className="bg-amber-500 hover:bg-amber-600 text-green-950 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wide transition-colors shadow-md"
                >
                  Invite Now
                </motion.button>
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
                      12.4K
                    </p>
                    <p className="text-[11px] text-green-100/50 uppercase tracking-wider">
                      Total Users
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-400">
                      Rs. 5M+
                    </p>
                    <p className="text-[11px] text-green-100/50 uppercase tracking-wider">
                      PKR Earned
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
