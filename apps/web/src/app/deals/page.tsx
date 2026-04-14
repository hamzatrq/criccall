"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deals, currentUser, formatCALL, getTierLabel, getTierColor } from "@/data/mock";
import { Lock, Check, Tag, Clock, Users, ChevronRight } from "lucide-react";

const categories = ["All", "Food", "Telecom", "Ecommerce", "Entertainment"] as const;

export default function DealsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [claimedDeal, setClaimedDeal] = useState<string | null>(null);

  const filtered = deals.filter(
    (d) => activeCategory === "All" || d.category === activeCategory.toLowerCase()
  );

  const canUnlock = (minCall: number) => currentUser.callBalance >= minCall;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-slate-900">Deals</h1>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getTierColor(currentUser.tier) }}
          />
          <span className="text-sm font-mono font-bold text-green-600">
            {formatCALL(currentUser.callBalance)}
          </span>
          <span className="text-xs text-green-600/60">CALL</span>
        </div>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        Exclusive perks from top brands. Your CALL balance unlocks better deals.
      </p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "text-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="dealTab"
                className="absolute inset-0 bg-[#00FF6A] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="space-y-4">
        {filtered.map((deal, i) => {
          const unlocked = canUnlock(deal.minCall);
          const claimed = claimedDeal === deal.id;

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative rounded-2xl border overflow-hidden ${
                unlocked
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-slate-200 bg-white shadow-sm opacity-70"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Brand logo */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      backgroundColor: deal.brandColor + "20",
                      color: deal.brandColor,
                    }}
                  >
                    {deal.brandLogo}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Brand + Title */}
                    <p className="text-xs text-slate-500 mb-0.5">
                      {deal.brandName}
                    </p>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{deal.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">
                      {deal.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {deal.totalRedeemed.toLocaleString()} redeemed
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires{" "}
                        {Math.ceil(
                          (new Date(deal.expiresAt).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )}
                        d
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 text-right">
                    {!unlocked ? (
                      <div>
                        <div className="flex items-center gap-1 text-slate-500 mb-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Locked</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Need{" "}
                          <span className="text-slate-900 font-bold">
                            {formatCALL(deal.minCall)}
                          </span>{" "}
                          CALL
                        </p>
                        <p className="text-[10px] text-red-600">
                          {formatCALL(deal.minCall - currentUser.callBalance)} more
                        </p>
                      </div>
                    ) : claimed ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-bold">Claimed</span>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setClaimedDeal(deal.id)}
                        className="px-4 py-2 rounded-lg bg-[#00FF6A] text-black text-sm font-bold"
                      >
                        Redeem
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Min CALL badge */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">
                      Requires{" "}
                      <span className="font-mono font-bold text-slate-900">
                        {formatCALL(deal.minCall)}
                      </span>{" "}
                      CALL
                    </span>
                    {unlocked && (
                      <span className="text-[10px] text-green-600 font-medium">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Claimed overlay */}
              <AnimatePresence>
                {claimed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    >
                      <Check className="w-12 h-12 text-green-600 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-green-600 mb-1">
                      Deal Redeemed!
                    </h3>
                    <p className="text-sm text-slate-500 mb-3">
                      {deal.brandName} — {deal.title}
                    </p>
                    <div className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-lg tracking-wider text-slate-900">
                      CRICCALL20
                    </div>
                    <button
                      onClick={() => setClaimedDeal(null)}
                      className="mt-4 text-xs text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
