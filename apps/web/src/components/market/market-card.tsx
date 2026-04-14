"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Market, getYesPercentage, formatPKR, formatCALL, timeUntil } from "@/data/mock";
import { Users, Trophy, Clock } from "lucide-react";

interface MarketCardProps {
  market: Market;
  featured?: boolean;
}

export function MarketCard({ market, featured = false }: MarketCardProps) {
  const yesPercent = getYesPercentage(market);
  const noPercent = 100 - yesPercent;
  const isLive = market.match.status === "live";
  const isResolved = market.state === "resolved";
  const titleSponsor = market.sponsors.find((s) => s.tier === "title");

  return (
    <Link href={`/markets/${market.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${featured ? "p-5" : "p-4"}`}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {titleSponsor ? `${titleSponsor.name} Presents` : market.match.tournament}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">{market.match.matchType}</span>
            {isLive && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-[9px] font-bold text-red-600 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            )}
            {isResolved && (
              <span className="px-1.5 py-0.5 rounded bg-green-50 text-[9px] font-bold text-green-700 uppercase">Done</span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{market.match.teamA.flag}</span>
            <span className="text-sm font-semibold text-slate-800">{market.match.teamA.shortName}</span>
            {market.match.score?.teamA && (
              <span className="text-xs font-mono text-slate-500">{market.match.score.teamA}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-800">{market.match.teamB.shortName}</span>
            <span className="text-lg">{market.match.teamB.flag}</span>
          </div>
        </div>

        {/* Question */}
        <p className="text-center text-sm font-semibold text-slate-900 mb-3">{market.question}</p>

        {/* Probability Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-green-700">YES {yesPercent}%</span>
            <span className="text-xs font-bold text-red-600">{noPercent}% NO</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-slate-100 flex">
            <motion.div
              className="h-full bg-green-500 rounded-l-full"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            />
            <motion.div
              className="h-full bg-red-500 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${noPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-amber-600 font-semibold">
            <Trophy className="w-3 h-3" />
            {formatPKR(market.totalPrize)}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {formatCALL(market.totalPredictors)}</span>
            {!isResolved && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {timeUntil(market.lockTime)}</span>}
          </div>
        </div>

        {/* Sponsors */}
        {market.sponsors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
            <span className="text-[9px] text-slate-400">Sponsored by</span>
            {market.sponsors.map((s) => (
              <span
                key={s.name}
                className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{ backgroundColor: s.bannerColor + "12", color: s.bannerColor }}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
