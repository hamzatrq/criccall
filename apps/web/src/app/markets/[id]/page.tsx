"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMarket, useMarketSponsors } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";
import {
  getTeamFlag,
  getYesPercentage,
  formatPKR,
  formatCALL,
  timeUntil,
} from "@/lib/utils";
import {
  Trophy,
  Users,
  Clock,
  Info,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Star,
  Loader2,
  LogIn,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MarketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: market, isLoading, isError } = useMarket(id);
  const { data: sponsorsData } = useMarketSponsors(id);
  const { isAuthenticated } = useAuth();

  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [predicted, setPredicted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
        <p className="text-slate-500 text-sm">Loading market...</p>
      </div>
    );
  }

  if (isError || !market) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Market not found</p>
      </div>
    );
  }

  const yesPercent = getYesPercentage(market.yesPool, market.noPool);
  const noPercent = 100 - yesPercent;
  const isLive = market.match?.status === "live";
  const isUpcoming = market.match?.status === "upcoming";
  const isResolved = market.state === "resolved";

  const sponsors: any[] = sponsorsData ?? market.campaigns ?? [];
  const titleSponsor = sponsors.find((s: any) => s.tier === "title");
  const goldSponsor = sponsors.find((s: any) => s.tier === "gold");
  const platformSponsor = sponsors.find((s: any) => s.tier === "sponsor");

  const teamAFlag = getTeamFlag(market.match?.teamA?.shortName);
  const teamBFlag = getTeamFlag(market.match?.teamB?.shortName);

  const yesPoolNum = Number(market.yesPool) || 0;
  const noPoolNum = Number(market.noPool) || 0;
  const totalPrizeNum = Number(market.totalPrize) || 0;

  const selectedPool = selectedPosition === "yes" ? yesPoolNum : noPoolNum;
  const selectedPercent = selectedPosition === "yes" ? yesPercent : noPercent;
  const estimatedReturn = selectedPercent > 0
    ? Math.round(amount * (100 / selectedPercent))
    : 0;
  const estimatedPKR = selectedPool > 0
    ? Math.round((amount / selectedPool) * totalPrizeNum)
    : 0;

  const maxBalance = 1000; // default max until on-chain balance is available

  const handlePredict = () => {
    setPredicted(true);
  };

  const quickAmounts = [25, 50, 75, 100];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28">
      {/* Match Info Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8"
      >
        <div className="p-4 md:p-6">
          {/* Top Row Labels */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {titleSponsor && (
                <span className="bg-green-700/10 text-green-700 text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                  {titleSponsor.name || titleSponsor.brandName} Presents
                </span>
              )}
              <span className="text-slate-500 text-xs font-medium uppercase tracking-tight">
                {market.match?.tournament} {market.match?.matchType}
              </span>
            </div>
            {isLive && (
              <div className="flex items-center gap-1 bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold">LIVE</span>
              </div>
            )}
            {isUpcoming && (
              <span className="text-xs font-medium text-slate-500">
                Starts {timeUntil(market.match?.startTime || market.lockTime)}
              </span>
            )}
          </div>

          {/* Match Info - Teams */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Team A */}
            <div className="flex flex-1 items-center justify-end gap-4 md:gap-6 w-full md:w-auto">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {market.match?.teamA?.name}
                </h2>
                {market.match?.score?.batting === "teamA" && (
                  <p className="text-sm text-slate-500 font-medium">BATTING</p>
                )}
                {market.match?.score?.batting === "teamB" && (
                  <p className="text-sm text-slate-500 font-medium">BOWLING</p>
                )}
              </div>
              <span className="text-5xl">{teamAFlag}</span>
            </div>

            {/* VS + Score */}
            <div className="flex flex-col items-center">
              <div className="text-green-700 font-black text-2xl tracking-tighter italic px-4">
                VS
              </div>
              {market.match?.score?.teamA && (
                <div className="mt-2 text-center">
                  <span className="text-3xl font-black tracking-tighter text-slate-900">
                    {market.match.score.teamA}
                  </span>
                  {market.match.score.overs && (
                    <span className="text-slate-500 text-sm font-semibold ml-1">
                      ({market.match.score.overs})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="flex flex-1 items-center justify-start gap-4 md:gap-6 w-full md:w-auto">
              <span className="text-5xl">{teamBFlag}</span>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {market.match?.teamB?.name}
                </h2>
                {market.match?.score?.batting === "teamB" && (
                  <p className="text-sm text-slate-500 font-medium">BATTING</p>
                )}
                {market.match?.score?.batting === "teamA" && (
                  <p className="text-sm text-slate-500 font-medium">BOWLING</p>
                )}
              </div>
            </div>
          </div>

          {/* Market Question */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {market.question}
            </h1>
          </div>

          {/* Probability Bar */}
          <div className="mb-8">
            <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <motion.div
                className="bg-green-700 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${yesPercent}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
              />
              <motion.div
                className="bg-red-600 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${noPercent}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 font-black text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <span>YES</span>
                <span>{yesPercent}%</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <span>{noPercent}%</span>
                <span>NO</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="font-bold text-sm">{formatPKR(market.totalPrize)}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Prize Pool
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-100 px-4">
              <div className="flex items-center gap-1.5 text-slate-900 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-bold text-sm">
                  {formatCALL(market.totalPredictors)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Predictions
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-slate-900 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-sm">{timeUntil(market.lockTime)}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Locks In
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Two Column Layout: Prediction Panel + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Prediction Panel (2/3 width) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          {!isAuthenticated && !isResolved && (
            <div className="text-center py-12">
              <LogIn className="w-10 h-10 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Connect Wallet to Predict
              </h3>
              <p className="text-sm text-slate-500">
                Sign in with your wallet to make predictions on this market.
              </p>
            </div>
          )}

          {isAuthenticated && !isResolved && !predicted && (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </span>
                Make Your Prediction
              </h3>

              {/* YES / NO Selection Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPosition("yes")}
                  className={`relative p-6 rounded-xl border-2 text-center transition-all ${
                    selectedPosition === "yes"
                      ? "border-green-700 bg-green-700/5"
                      : "border-slate-200 hover:border-green-700/30 hover:bg-green-700/5"
                  }`}
                >
                  {selectedPosition === "yes" && (
                    <div className="absolute top-2 right-2 text-green-700">
                      <CheckCircle className="w-5 h-5 fill-green-700 text-white" />
                    </div>
                  )}
                  <div
                    className={`font-black text-2xl mb-1 italic ${
                      selectedPosition === "yes" ? "text-green-700" : "text-green-700/60"
                    }`}
                  >
                    YES
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      selectedPosition === "yes" ? "text-green-700" : "text-slate-500"
                    }`}
                  >
                    {yesPercent}% chance
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPosition("no")}
                  className={`relative p-6 rounded-xl border-2 text-center transition-all ${
                    selectedPosition === "no"
                      ? "border-red-600 bg-red-600/5"
                      : "border-slate-200 hover:border-red-600/30 hover:bg-red-600/5"
                  }`}
                >
                  {selectedPosition === "no" && (
                    <div className="absolute top-2 right-2 text-red-600">
                      <CheckCircle className="w-5 h-5 fill-red-600 text-white" />
                    </div>
                  )}
                  <div
                    className={`font-black text-2xl mb-1 italic ${
                      selectedPosition === "no" ? "text-red-600" : "text-red-600/60"
                    }`}
                  >
                    NO
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      selectedPosition === "no" ? "text-red-600" : "text-slate-500"
                    }`}
                  >
                    {noPercent}% chance
                  </div>
                </motion.button>
              </div>

              {/* Amount Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                    Prediction Amount
                  </label>
                  <span className="text-green-700 font-black text-lg">
                    {amount} CALL
                  </span>
                </div>

                {/* Slider */}
                <div className="relative w-full">
                  <input
                    type="range"
                    min={10}
                    max={maxBalance}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-700"
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold">
                    <span>10 CALL</span>
                    <span>{formatCALL(maxBalance)} CALL</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(Math.min(q, maxBalance))}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                        amount === q
                          ? "bg-green-700 text-white ring-2 ring-green-700/20"
                          : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Return */}
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200/50 flex items-start gap-4">
                <Info className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900 leading-tight">
                    Estimated Return:{" "}
                    <span className="font-bold">
                      {estimatedReturn.toFixed(1)} CALL
                    </span>
                  </p>
                  <p className="text-xs text-green-800/80 mt-1 italic">
                    Based on current pool, your estimated PKR share:{" "}
                    <span className="font-bold text-green-700">
                      Rs. {estimatedPKR.toLocaleString("en-PK")}.00
                    </span>
                  </p>
                </div>
              </div>

              {/* Predict Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePredict}
                className="w-full mt-8 bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-xl shadow-lg shadow-green-700/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>
                  Predict {selectedPosition.toUpperCase()} with {amount} CALL
                </span>
                <TrendingUp className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </>
          )}

          {/* Predicted Confirmation */}
          <AnimatePresence>
            {predicted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center"
                >
                  <span className="text-3xl">{"\u{1F3CF}"}</span>
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-green-700">
                  You&apos;re in!
                </h3>
                <p className="text-sm text-slate-500">
                  {amount} CALL on {selectedPosition.toUpperCase()}. Good luck!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resolved State */}
          {isResolved && !predicted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-8 ${
                market.resolvedOutcome === "yes" ? "text-green-700" : "text-red-600"
              }`}
            >
              <p className="text-sm uppercase tracking-wider text-slate-500 mb-2">
                Resolved
              </p>
              <p className="text-2xl font-bold">
                {market.resolvedOutcome === "yes" ? "YES won" : "NO won"}
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* RIGHT: Sidebar */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Prize Pool Highlight Card */}
          <div className="bg-gradient-to-br from-green-700 to-green-900 p-6 rounded-xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Current Prize Pool
              </span>
              <Trophy className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-3xl font-black mb-1 tracking-tight">
              Rs. {totalPrizeNum.toLocaleString("en-PK")}
            </div>
            <div className="text-xs text-white/70 font-medium">
              Distributed among winning predictions
            </div>
          </div>

          {/* Partners & Sponsors */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
              Partners & Sponsors
            </h3>
            <div className="space-y-6">
              {/* Title Sponsor */}
              {titleSponsor && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center p-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: titleSponsor.bannerColor || "#00A651" }}
                    >
                      {titleSponsor.logo || titleSponsor.brandName?.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700">TITLE SPONSOR</p>
                    <p className="text-sm font-bold text-slate-900">
                      {titleSponsor.name || titleSponsor.brandName}
                    </p>
                  </div>
                </div>
              )}

              {/* Gold Sponsor */}
              {goldSponsor && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center p-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: goldSponsor.bannerColor || "#E4002B" }}
                    >
                      {goldSponsor.logo || goldSponsor.brandName?.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600">GOLD SPONSOR</p>
                    <p className="text-sm font-bold text-slate-900">
                      {goldSponsor.name || goldSponsor.brandName}
                    </p>
                  </div>
                </div>
              )}

              {/* Platform */}
              {platformSponsor && (
                <div className="flex items-center gap-4 opacity-80">
                  <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center p-2">
                    <span className="text-white font-black text-xs">
                      {platformSponsor.logo || "CC"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-500">PLATFORM</p>
                    <p className="text-sm font-bold text-slate-900">CricCall App</p>
                  </div>
                </div>
              )}

              {/* If no sponsors loaded yet, show placeholder */}
              {sponsors.length === 0 && (
                <p className="text-xs text-slate-400">No sponsors for this market yet.</p>
              )}
            </div>
          </div>

          {/* Shariah Compliance Note */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-500">
                <span className="font-bold text-slate-900">
                  Shariah Compliant:
                </span>{" "}
                This platform operates on a tournament participation model where
                entry is based on skill-based prediction points. No monetary
                gambling involved. Prizes are sponsored by brand partners.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
