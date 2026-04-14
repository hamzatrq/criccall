"use client";

import { motion } from "framer-motion";
import { leaderboard, formatCALL, getTierLabel, getTierColor, currentUser } from "@/data/mock";
import { Crown, TrendingUp } from "lucide-react";

const rankEmojis: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
      <p className="text-slate-500 mb-8">
        Ranked by CALL balance. More CALL = better predictor.
      </p>

      {/* Your position */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white">
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">{currentUser.displayName}</p>
              <p
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: getTierColor(currentUser.tier) }}
              >
                {getTierLabel(currentUser.tier)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-green-600">
              {formatCALL(currentUser.callBalance)} CALL
            </p>
            <p className="text-xs text-slate-500">
              #{42} · {currentUser.winRate}% win rate
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {leaderboard.slice(0, 3).map((entry, i) => {
          const order = [1, 0, 2]; // 2nd, 1st, 3rd
          const idx = order[i];
          const e = leaderboard[idx];
          const isFirst = idx === 0;

          return (
            <motion.div
              key={e.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-4 rounded-2xl border text-center ${
                isFirst
                  ? "border-amber-200 bg-amber-50 -mt-4"
                  : "border-slate-200 bg-white border border-slate-200 shadow-sm"
              }`}
            >
              {isFirst && (
                <Crown className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              )}
              <span className="text-2xl block mb-2">{rankEmojis[idx + 1]}</span>
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-2"
                style={{
                  background: `linear-gradient(135deg, ${getTierColor(e.tier)}40, ${getTierColor(e.tier)}15)`,
                  border: `1px solid ${getTierColor(e.tier)}30`,
                }}
              >
                {e.displayName.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm font-semibold truncate text-slate-900">{e.displayName}</p>
              <p className="font-mono font-bold text-sm mt-1 text-slate-900">
                {formatCALL(e.callBalance)}
              </p>
              <p className="text-[10px] text-slate-500">CALL</p>
              <p
                className="text-[10px] font-medium uppercase tracking-wider mt-1"
                style={{ color: getTierColor(e.tier) }}
              >
                {getTierLabel(e.tier)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="w-8 text-center shrink-0">
              {rankEmojis[entry.rank] ? (
                <span className="text-xl">{rankEmojis[entry.rank]}</span>
              ) : (
                <span className="text-sm font-bold text-slate-500 font-mono">
                  {entry.rank}
                </span>
              )}
            </div>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${getTierColor(entry.tier)}40, ${getTierColor(entry.tier)}15)`,
                border: `1px solid ${getTierColor(entry.tier)}30`,
              }}
            >
              {entry.displayName.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-slate-900">
                {entry.displayName}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: getTierColor(entry.tier) }}
              >
                {getTierLabel(entry.tier)}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-sm tabular-nums text-slate-900">
                {formatCALL(entry.callBalance)}
              </p>
              <p className="text-[10px] text-slate-500">CALL</p>
            </div>

            <div className="text-right shrink-0 w-16">
              <p className="text-sm font-mono text-green-600 tabular-nums">
                {entry.winRate}%
              </p>
              <p className="text-[10px] text-slate-500">Win Rate</p>
            </div>

            <div className="hidden md:block w-24 shrink-0">
              <div className="h-2 rounded-full overflow-hidden bg-slate-50">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getTierColor(entry.tier) }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(entry.callBalance / leaderboard[0].callBalance) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
