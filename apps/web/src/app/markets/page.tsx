"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMarkets } from "@/hooks/use-api";
import {
  getYesPercentage,
  formatPKR,
  timeUntil,
} from "@/lib/utils";
import { TeamLogo } from "@/components/shared/team-logo";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const tabs = ["All", "Live", "Upcoming", "Resolved"] as const;
type Tab = (typeof tabs)[number];

// Map tab names to API status params
const tabStatusMap: Record<Tab, string | undefined> = {
  All: undefined,
  Live: "live",
  Upcoming: "upcoming",
  Resolved: "resolved",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

function StatusBadge({ market }: { market: any }) {
  const matchStatus = market.match?.status;
  const isLive = matchStatus === "live" && market.state !== "resolved";
  const isResolved = market.state === "resolved";
  const isUpcoming = matchStatus === "upcoming" && market.state === "open";

  if (isLive) {
    return (
      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        Live
      </span>
    );
  }

  if (isResolved) {
    return (
      <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded">
        RESOLVED
      </span>
    );
  }

  if (isUpcoming) {
    return (
      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
        {timeUntil(market.lockTime).toUpperCase()}
      </span>
    );
  }

  return null;
}

function StitchMarketCard({ market, index }: { market: any; index: number }) {
  const yesPercent = getYesPercentage(market.yesPool, market.noPool);
  const noPercent = 100 - yesPercent;
  const isResolved = market.state === "resolved";
  const isLive = market.match?.status === "live" && market.state !== "resolved";

  const teamAShortName = market.match?.teamA?.shortName || market.match?.teamA?.name?.slice(0, 3)?.toUpperCase() || "TBA";
  const teamBShortName = market.match?.teamB?.shortName || market.match?.teamB?.name?.slice(0, 3)?.toUpperCase() || "TBA";

  const sponsors = market.campaigns || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link href={`/markets/${market.id}`}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
            isResolved ? "opacity-75" : ""
          }`}
        >
          {/* Card Body */}
          <div className="p-5">
            {/* Header: teams + status badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <TeamLogo shortName={teamAShortName} size="sm" />
                  <TeamLogo shortName={teamBShortName} size="sm" />
                </div>
                <span className="text-sm font-bold text-slate-500">
                  {market.match?.teamA?.shortName} vs {market.match?.teamB?.shortName}
                </span>
              </div>
              <StatusBadge market={market} />
            </div>

            {/* Question */}
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4">
              {market.question}
            </h3>

            {/* Resolved outcome banner */}
            {isResolved && market.resolvedOutcome != null && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  market.yesWon
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {market.yesWon ? (
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-bold ${
                    market.yesWon ? "text-green-700" : "text-red-600"
                  }`}
                >
                  OUTCOME: {market.yesWon ? "YES" : "NO"}
                </span>
              </div>
            )}

            {/* Probability bar (only for non-resolved) */}
            {!isResolved && (
              <div className="space-y-4">
                <div className="w-full h-3 bg-red-100 rounded-full flex overflow-hidden">
                  <motion.div
                    className="h-full bg-green-800"
                    initial={{ width: 0 }}
                    animate={{ width: `${yesPercent}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.15 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-green-800">{yesPercent}% YES</span>
                  <span className="text-red-600">{noPercent}% NO</span>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                  {isResolved ? "Total Distributed" : isLive ? "Current Prize Pool" : "Starting Pool"}
                </p>
                <p className="text-lg font-black text-amber-600">
                  {formatPKR(market.totalPrize)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                  {isResolved ? "Total Winners" : "Predictions"}
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {(Number(market.totalPredictors) || 0).toLocaleString("en-PK")}
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer - sponsors */}
          <div className="px-5 py-3 bg-slate-50 flex justify-between items-center">
            <div className="flex gap-2 items-center">
              {sponsors.map((s: any) => (
                <span
                  key={s.name || s.id}
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium opacity-60"
                  style={{
                    backgroundColor: (s.bannerColor || "#16A34A") + "18",
                    color: s.bannerColor || "#16A34A",
                  }}
                >
                  {s.name || s.brandName || "Sponsor"}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              {isResolved
                ? "COMPLETED"
                : isLive
                  ? `ENDS IN ${timeUntil(market.lockTime).toUpperCase()}`
                  : "PRE-MATCH OPEN"}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const status = tabStatusMap[activeTab];
  const { data, isLoading, isError } = useMarkets(
    status ? { status } : undefined,
  );

  // The API may return { data: [...] } or just an array
  const markets: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black text-green-900 tracking-tight">Markets</h2>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="marketTab"
                  className="absolute inset-0 bg-green-800 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab === "Live" && activeTab !== tab && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Cards Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
            <p className="text-slate-500 text-sm">Loading markets...</p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">{"\u26A0\uFE0F"}</p>
            <p className="text-slate-500">Failed to load markets. Please try again.</p>
          </motion.div>
        ) : markets.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">{"\u{1F3CF}"}</p>
            <p className="text-slate-500">No markets found for this filter.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {markets.map((market: any, i: number) => (
              <StitchMarketCard key={market.id} market={market} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
