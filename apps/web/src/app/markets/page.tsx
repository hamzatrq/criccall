"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/market/market-card";
import { markets } from "@/data/mock";

const tabs = ["All", "Live", "Upcoming", "Resolved"] as const;
type Tab = (typeof tabs)[number];

const filterMap: Record<Tab, (m: (typeof markets)[0]) => boolean> = {
  All: () => true,
  Live: (m) => m.match.status === "live" && m.state === "open",
  Upcoming: (m) => m.match.status === "upcoming" && m.state === "open",
  Resolved: (m) => m.state === "resolved",
};

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const filtered = markets.filter(filterMap[activeTab]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Markets</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="marketTab"
                className="absolute inset-0 bg-green-600 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">{"\u{1F3CF}"}</p>
          <p className="text-slate-500">No markets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((market, i) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <MarketCard market={market} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
