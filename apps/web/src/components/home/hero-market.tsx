"use client";

import { motion } from "framer-motion";
import { Market, getYesPercentage, formatPKR, formatCALL, timeUntil } from "@/data/mock";
import { Users, Trophy, Clock, Zap } from "lucide-react";

interface HeroMarketProps {
  market: Market;
}

export function HeroMarket({ market }: HeroMarketProps) {
  const yesPercent = getYesPercentage(market);
  const noPercent = 100 - yesPercent;
  const titleSponsor = market.sponsors.find((s) => s.tier === "title");
  const isLive = market.match.status === "live";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <div className="relative p-6 md:p-10">
        {/* Title sponsor */}
        {titleSponsor && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2"
          >
            <span
              className="text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: titleSponsor.bannerColor }}
            >
              {titleSponsor.name} Presents
            </span>
          </motion.div>
        )}

        {/* Live badge */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Live Now
              </span>
            </div>
          </motion.div>
        )}

        {/* Tournament */}
        <p className="text-center text-sm text-slate-500 mb-4">
          {market.match.tournament} · {market.match.matchType} ·{" "}
          {market.match.venue}
        </p>

        {/* Teams - Big */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-8 md:gap-16 mb-6"
        >
          <div className="text-center">
            <span className="text-5xl md:text-7xl block mb-2">
              {market.match.teamA.flag}
            </span>
            <p className="text-xl md:text-2xl font-bold text-slate-900">
              {market.match.teamA.name}
            </p>
            {market.match.score?.teamA && (
              <motion.p
                className="text-lg font-mono mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-slate-900 font-bold">
                  {market.match.score.teamA}
                </span>
                {market.match.score.batting === "teamA" && (
                  <span className="text-green-600 text-sm ml-1">
                    ({market.match.score.overs})
                  </span>
                )}
              </motion.p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500 tracking-widest">
                VS
              </span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-5xl md:text-7xl block mb-2">
              {market.match.teamB.flag}
            </span>
            <p className="text-xl md:text-2xl font-bold text-slate-900">
              {market.match.teamB.name}
            </p>
            {market.match.score?.teamB && (
              <p className="text-lg font-mono mt-1 text-slate-900">
                {market.match.score.teamB}
              </p>
            )}
          </div>
        </motion.div>

        {/* Question */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xl md:text-2xl font-bold text-slate-900 mb-6"
        >
          {market.question}
        </motion.p>

        {/* Big Probability Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="mb-6 max-w-xl mx-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-green-600">
              YES {yesPercent}%
            </span>
            <span className="text-lg font-bold text-red-600">
              {noPercent}% NO
            </span>
          </div>
          <div className="relative h-5 rounded-full overflow-hidden bg-slate-100">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 15,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full rounded-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${noPercent}%` }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 15,
                delay: 0.5,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-mono">
            <span>{formatCALL(market.yesPool)} CALL</span>
            <span>{formatCALL(market.noPool)} CALL</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Predict YES
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Predict NO
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-1.5 text-amber-600">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{formatPKR(market.totalPrize)}</span>
            <span className="text-amber-600/60">Prize Pool</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-4 h-4" />
            <span className="font-mono">
              {formatCALL(market.totalPredictors)}
            </span>
            <span>predictions</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Locks {timeUntil(market.lockTime)}</span>
          </div>
        </motion.div>

        {/* Sponsors */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-200">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Sponsored by
          </span>
          {market.sponsors.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: s.bannerColor + "15",
                color: s.bannerColor,
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
