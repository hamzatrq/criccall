"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  markets,
  getYesPercentage,
  formatPKR,
  formatCALL,
  timeUntil,
  currentUser,
} from "@/data/mock";
import {
  Trophy,
  Users,
  Clock,
  ChevronLeft,
  Info,
  TrendingUp,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function MarketDetailPage() {
  const params = useParams();
  const market = markets.find((m) => m.id === Number(params.id));
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = useState(50);
  const [showConfirm, setShowConfirm] = useState(false);
  const [predicted, setPredicted] = useState(false);

  if (!market) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Market not found</p>
      </div>
    );
  }

  const yesPercent = getYesPercentage(market);
  const noPercent = 100 - yesPercent;
  const isLive = market.match.status === "live";
  const isResolved = market.state === "resolved";
  const titleSponsor = market.sponsors.find((s) => s.tier === "title");

  const handlePredict = () => {
    setPredicted(true);
    setShowConfirm(false);
  };

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-6">
      {/* Back button */}
      <Link
        href="/markets"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Markets
      </Link>

      {/* Market Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 mb-6">
        {isLive && (
          <div className="absolute inset-0 bg-gradient-to-b from-green-50 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Sponsor + Status */}
        <div className="flex items-center justify-between mb-4 relative">
          {titleSponsor && (
            <span
              className="text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: titleSponsor.bannerColor }}
            >
              {titleSponsor.name} Presents
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {market.match.tournament} · {market.match.matchType}
            </span>
            {isLive && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold uppercase text-red-600">
                  Live
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-8 md:gap-16 mb-6 relative">
          <div className="text-center">
            <span className="text-4xl md:text-6xl block mb-2">
              {market.match.teamA.flag}
            </span>
            <p className="text-lg md:text-xl font-bold text-slate-900">
              {market.match.teamA.name}
            </p>
            {market.match.score?.teamA && (
              <p className="text-base font-mono mt-1">
                <span className="font-bold">{market.match.score.teamA}</span>
                {market.match.score.batting === "teamA" && (
                  <span className="text-green-600 text-sm ml-1">
                    ({market.match.score.overs})
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-500">VS</span>
          </div>
          <div className="text-center">
            <span className="text-4xl md:text-6xl block mb-2">
              {market.match.teamB.flag}
            </span>
            <p className="text-lg md:text-xl font-bold text-slate-900">
              {market.match.teamB.name}
            </p>
            {market.match.score?.teamB && (
              <p className="text-base font-mono mt-1">{market.match.score.teamB}</p>
            )}
          </div>
        </div>

        {/* Question */}
        <h1 className="text-center text-2xl md:text-3xl font-bold mb-6 text-slate-900">
          {market.question}
        </h1>

        {/* Probability Bar */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-green-600">
              YES {yesPercent}%
            </span>
            <span className="text-lg font-bold text-red-600">
              {noPercent}% NO
            </span>
          </div>
          <div className="relative h-5 rounded-full overflow-hidden bg-slate-50">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-400/40 rounded-full" />
            </motion.div>
            <motion.div
              className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-red-500 to-red-600"
              initial={{ width: 0 }}
              animate={{ width: `${noPercent}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-red-400/40 rounded-full" />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500 font-mono">
            <span>{formatCALL(market.yesPool)} CALL</span>
            <span>{formatCALL(market.noPool)} CALL</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{formatPKR(market.totalPrize)}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className="font-mono">{formatCALL(market.totalPredictors)}</span>
          </div>
          {!isResolved && (
            <>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Locks {timeUntil(market.lockTime)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prediction Panel */}
      {!isResolved && !predicted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4 text-slate-900">Make Your Prediction</h2>

          {/* Position Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPosition("yes")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPosition === "yes"
                  ? "border-green-200 bg-green-50 shadow-md hover:shadow-lg transition-shadow"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <p className="text-2xl font-bold text-green-600 mb-1">YES</p>
              <p className="text-sm text-slate-500">{yesPercent}% chance</p>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPosition("no")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPosition === "no"
                  ? "border-red-200 bg-red-50 shadow-md hover:shadow-lg transition-shadow"
                  : "border-slate-200 hover:border-red-300"
              }`}
            >
              <p className="text-2xl font-bold text-red-600 mb-1">NO</p>
              <p className="text-sm text-slate-500">{noPercent}% chance</p>
            </motion.button>
          </div>

          {/* Amount Slider */}
          <AnimatePresence>
            {selectedPosition && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Amount</span>
                    <span className="text-sm font-mono font-bold">
                      {amount} <span className="text-slate-500">CALL</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={currentUser.callBalance}
                    step={10}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-slate-100 accent-green-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>10 CALL</span>
                    <span>{formatCALL(currentUser.callBalance)} CALL</span>
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 mb-6">
                  {[25, 50, 75, 100].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(Math.min(q, currentUser.callBalance))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        amount === q
                          ? "bg-slate-200 text-slate-900"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Potential return info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">If you win</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">CALL return (est.)</span>
                    <span className="font-mono font-bold text-green-600">
                      ~{Math.round(amount * (100 / (selectedPosition === "yes" ? yesPercent : noPercent)))} CALL
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-500">PKR prize share (est.)</span>
                    <span className="font-mono font-bold text-amber-600">
                      ~{formatPKR(Math.round((amount / (selectedPosition === "yes" ? market.yesPool : market.noPool)) * market.totalPrize))}
                    </span>
                  </div>
                </div>

                {/* Confirm button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePredict}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedPosition === "yes"
                      ? "bg-green-600 text-white shadow-md hover:shadow-lg transition-shadow"
                      : "bg-red-600 text-white shadow-md hover:shadow-lg transition-shadow"
                  }`}
                >
                  Predict {selectedPosition?.toUpperCase()} with {amount} CALL
                </motion.button>

                <p className="text-center text-[10px] text-slate-500 mt-3">
                  <Shield className="w-3 h-3 inline mr-1" />
                  CALL tokens have zero monetary value. This is not gambling.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Predicted confirmation */}
      <AnimatePresence>
        {predicted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 mb-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center"
            >
              <span className="text-3xl">{"\u{1F3CF}"}</span>
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-green-600">You&apos;re in!</h3>
            <p className="text-sm text-slate-500">
              {amount} CALL on {selectedPosition?.toUpperCase()}. Good luck!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolved state */}
      {isResolved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl border-2 p-6 mb-6 text-center ${
            market.resolvedOutcome === "yes"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-sm uppercase tracking-wider text-slate-500 mb-2">
            Resolved
          </p>
          <p className="text-2xl font-bold">
            {market.resolvedOutcome === "yes" ? (
              <span className="text-green-600">YES won</span>
            ) : (
              <span className="text-red-600">NO won</span>
            )}
          </p>
        </motion.div>
      )}

      {/* Sponsors Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4 text-slate-900">Sponsors</h3>
        <div className="space-y-3">
          {market.sponsors
            .sort((a, b) => b.prizeAmount - a.prizeAmount)
            .map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: s.bannerColor + "20",
                      color: s.bannerColor,
                    }}
                  >
                    {s.logo}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: s.tier === "title" ? "#d97706" : s.tier === "gold" ? "#2563eb" : "#6B7280" }}
                    >
                      {s.tier} sponsor
                    </p>
                  </div>
                </div>
                <p className="font-mono font-bold text-sm text-amber-600">
                  {formatPKR(s.prizeAmount)}
                </p>
              </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total Prize Pool</span>
          <span className="font-mono font-bold text-amber-600">
            {formatPKR(market.totalPrize)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">How it works</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">1.</span>
            Spend CALL tokens on YES or NO
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">2.</span>
            If you&apos;re right, you win CALL from the losing pool (proportional to your bet)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">3.</span>
            All correct predictors also share the PKR prize pool
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">4.</span>
            Results verified on-chain via WireScan
          </li>
        </ul>
      </div>
    </div>
  );
}
