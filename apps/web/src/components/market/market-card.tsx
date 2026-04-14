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
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow ${
          featured ? "p-6" : "p-4"
        }`}
      >
        {/* Subtle highlight for live matches */}
        {isLive && (
          <div className="absolute inset-0 bg-gradient-to-b from-green-50 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Top row: Tournament + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {titleSponsor && (
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                {titleSponsor.name} Presents
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {market.match.tournament} · {market.match.matchType}
            </span>
            {isLive && (
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
                <span className="text-[10px] font-bold uppercase text-red-600">
                  Live
                </span>
              </div>
            )}
            {isResolved && (
              <span className="text-[10px] font-bold uppercase text-green-600">
                Resolved
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className={`flex items-center justify-center gap-4 ${featured ? "mb-4" : "mb-3"}`}>
          <div className="flex items-center gap-2">
            <span className={featured ? "text-3xl" : "text-xl"}>
              {market.match.teamA.flag}
            </span>
            <div className="text-right">
              <p className={`font-bold text-slate-900 ${featured ? "text-lg" : "text-sm"}`}>
                {market.match.teamA.shortName}
              </p>
              {market.match.score?.teamA && (
                <p className="text-xs font-mono text-slate-500">
                  {market.match.score.teamA}
                  {market.match.score.batting === "teamA" && (
                    <span className="text-green-600">
                      {" "}
                      ({market.match.score.overs})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            vs
          </span>

          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className={`font-bold text-slate-900 ${featured ? "text-lg" : "text-sm"}`}>
                {market.match.teamB.shortName}
              </p>
              {market.match.score?.teamB && (
                <p className="text-xs font-mono text-slate-500">
                  {market.match.score.teamB}
                </p>
              )}
            </div>
            <span className={featured ? "text-3xl" : "text-xl"}>
              {market.match.teamB.flag}
            </span>
          </div>
        </div>

        {/* Question */}
        <p
          className={`text-center font-semibold text-slate-900 mb-4 ${
            featured ? "text-lg" : "text-sm"
          }`}
        >
          {market.question}
        </p>

        {/* Probability Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-green-600">
              YES {yesPercent}%
            </span>
            <span className="text-sm font-bold text-red-600">
              {noPercent}% NO
            </span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden bg-slate-100">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.1,
              }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full rounded-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${noPercent}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.1,
              }}
            />
          </div>
        </div>

        {/* Prize + Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">{formatPKR(market.totalPrize)}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="text-xs font-mono">
                {formatCALL(market.totalPredictors)}
              </span>
            </div>
            {!isResolved && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {timeUntil(market.lockTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor bar */}
        {market.sponsors.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
            {market.sponsors.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: s.bannerColor + "15",
                  color: s.bannerColor,
                }}
              >
                {s.logo}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
