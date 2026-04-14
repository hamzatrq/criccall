"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { leaderboard, formatCALL, getTierLabel, getTierColor } from "@/data/mock";
import { ChevronRight } from "lucide-react";

const rankEmojis: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

export function LeaderboardPreview() {
  const top5 = leaderboard.slice(0, 5);

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-slate-900"
        >
          Leaderboard
        </motion.h2>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {top5.map((entry, i) => (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Rank */}
            <div className="w-10 text-center shrink-0">
              {rankEmojis[entry.rank] ? (
                <span className="text-2xl">{rankEmojis[entry.rank]}</span>
              ) : (
                <span className="text-lg font-bold text-slate-500 font-mono">
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${getTierColor(entry.tier)}40, ${getTierColor(entry.tier)}15)`,
                  border: `1px solid ${getTierColor(entry.tier)}30`,
                }}
              >
                {entry.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {entry.displayName}
                </p>
                <p
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: getTierColor(entry.tier) }}
                >
                  {getTierLabel(entry.tier)}
                </p>
              </div>
            </div>

            {/* CALL Balance */}
            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                {formatCALL(entry.callBalance)}
              </p>
              <p className="text-[10px] text-slate-500">CALL</p>
            </div>

            {/* Win Rate */}
            <div className="hidden sm:block text-right shrink-0 w-16">
              <p className="text-sm font-mono text-green-600 tabular-nums">
                {entry.winRate}%
              </p>
              <p className="text-[10px] text-slate-500">Win Rate</p>
            </div>

            {/* Bar */}
            <div className="hidden md:block w-32 shrink-0">
              <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getTierColor(entry.tier) }}
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${(entry.callBalance / leaderboard[0].callBalance) * 100}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
