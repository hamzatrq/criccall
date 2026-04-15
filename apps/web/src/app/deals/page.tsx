"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCALL } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useDeals } from "@/hooks/use-api";
import { useCallBalance, formatCallBalance } from "@/hooks/use-contracts";
import { api } from "@/lib/api";
import {
  Lock,
  CheckCircle,
  Clock,
  Users,
  Star,
  X,
  Copy,
  Loader2,
  ShoppingBag,
  Wallet,
} from "lucide-react";

const categories = [
  "All",
  "Food",
  "Telecom",
  "Ecommerce",
  "Entertainment",
] as const;

export default function DealsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [claimedDeal, setClaimedDeal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const categoryParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
  const { data: dealsData, isLoading } = useDeals({ category: categoryParam });

  const allDeals = dealsData?.data || dealsData || [];
  const { data: onChainBalance } = useCallBalance();
  const callBalance = onChainBalance
    ? Math.floor(Number(formatCallBalance(onChainBalance as bigint)))
    : Number(user?.cachedCallBalance || 0);

  const canUnlock = (minCall: number) => isAuthenticated && callBalance >= minCall;

  const handleRedeem = async (dealId: string) => {
    setRedeeming(dealId);
    setRedeemError(null);
    try {
      const result = await api.redeemDeal(dealId);
      const code = result?.code || result?.redeemCode;
      if (!code) {
        setRedeemError("Redemption failed. Please try again.");
        return;
      }
      setRedeemCode(code);
      setClaimedDeal(dealId);
    } catch {
      setRedeemError("Redemption failed. Please try again.");
    } finally {
      setRedeeming(null);
    }
  };

  const handleCopy = () => {
    if (!redeemCode) return;
    navigator.clipboard.writeText(redeemCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysUntil = (dateStr: string) =>
    Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Deals
            </h1>
            {isAuthenticated && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {formatCALL(callBalance)} CALL
              </div>
            )}
          </div>
          <p className="mt-2 text-slate-500 max-w-2xl font-medium">
            Redeem your hard-earned CALL tokens for exclusive rewards from our
            partners.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-8 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-green-700 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading deals...</p>
        </div>
      ) : allDeals.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">
            No deals available
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Check back soon for new brand deals.
          </p>
        </div>
      ) : (
        /* Deals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDeals.map((deal: any, i: number) => {
            const minCall = deal.minCall || 0;
            const unlocked = canUnlock(minCall);
            const claimed = claimedDeal === deal.id;

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl border overflow-hidden flex flex-col ${
                  unlocked
                    ? "bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group"
                    : "bg-slate-50 border-slate-200 grayscale-[0.3]"
                }`}
              >
                {/* Card Content */}
                <div className="p-5 flex gap-4">
                  {/* Brand Logo */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${
                      !unlocked ? "opacity-80" : ""
                    }`}
                    style={{
                      backgroundColor: (deal.brandColor || "#6B7280") + "20",
                      color: deal.brandColor || "#6B7280",
                    }}
                  >
                    {deal.brandLogo || deal.brandName?.slice(0, 2) || "??"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${
                        unlocked
                          ? "text-slate-500"
                          : "text-slate-500 opacity-60"
                      }`}
                    >
                      {deal.brandName || "Brand"}
                    </p>
                    <h3
                      className={`text-lg font-bold text-slate-900 leading-tight mb-1 truncate ${
                        !unlocked ? "opacity-70" : ""
                      }`}
                    >
                      {deal.title}
                    </h3>
                    <p
                      className={`text-sm text-slate-500 line-clamp-2 ${
                        !unlocked ? "opacity-60" : ""
                      }`}
                    >
                      {deal.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 mt-auto">
                  {/* Meta */}
                  <div
                    className={`flex items-center gap-4 text-xs text-slate-500 font-medium mb-4 ${
                      !unlocked ? "opacity-60" : ""
                    }`}
                  >
                    {deal.totalRedeemed !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {deal.totalRedeemed >= 1000
                          ? `${(deal.totalRedeemed / 1000).toFixed(1)}k`
                          : deal.totalRedeemed}{" "}
                        redeemed
                      </span>
                    )}
                    {deal.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expires {daysUntil(deal.expiresAt)}d
                      </span>
                    )}
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    {!isAuthenticated ? (
                      <>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          Sign in to redeem
                        </div>
                        <div className="bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold">
                          <Lock className="w-3 h-3" />
                          Locked
                        </div>
                      </>
                    ) : unlocked ? (
                      <>
                        <div className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 fill-green-700 text-white" />
                          Requires {formatCALL(minCall)} CALL
                        </div>
                        {claimed ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-bold">Claimed</span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRedeem(deal.id)}
                            disabled={redeeming === deal.id}
                            className="px-4 py-2 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          >
                            {redeeming === deal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            {redeeming === deal.id ? "Redeeming..." : "Redeem"}
                          </motion.button>
                        )}
                        {redeemError && redeeming !== deal.id && !claimed && (
                          <p className="text-xs text-red-600 font-medium mt-1">{redeemError}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          Requires {formatCALL(minCall)} CALL
                        </div>
                        <div className="bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold">
                          <Lock className="w-3 h-3" />
                          Need {formatCALL(minCall)} CALL
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Claimed Overlay */}
                <AnimatePresence>
                  {claimed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          delay: 0.1,
                        }}
                      >
                        <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-green-700 mb-1">
                        Deal Redeemed!
                      </h3>
                      <p className="text-sm text-slate-500 mb-3 text-center">
                        {deal.brandName} — {deal.title}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-lg tracking-wider text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        {redeemCode}
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                      {copied && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          Copied!
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setClaimedDeal(null);
                          setCopied(false);
                        }}
                        className="mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Close
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
