"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCALL } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useDeals } from "@/hooks/use-api";
import { useCallBalance, formatCallBalance } from "@/hooks/use-contracts";
import { api } from "@/lib/api";
import Image from "next/image";
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

/* eslint-disable @typescript-eslint/no-explicit-any */

const categories = [
  "All",
  "Food",
  "Telecom",
  "Ecommerce",
  "Entertainment",
  "Sports",
] as const;

const brandData: Record<string, { image: string; color: string; name: string }> = {
  foodpanda: { image: "/brand-images/foodpanda-logo.jpeg", color: "#D70F64", name: "Foodpanda" },
  kfc: { image: "/brand-images/kfc-logo.png", color: "#E4002B", name: "KFC" },
  jazz: { image: "/brand-images/jazz.jpeg", color: "#ED1C24", name: "Jazz" },
  daraz: { image: "/brand-images/daraz-logo.jpeg", color: "#F85606", name: "Daraz" },
  ptcl: { image: "/brand-images/ptcl-logo.jpeg", color: "#00A651", name: "PTCL" },
  psl: { image: "/brand-images/psl-logo.jpeg", color: "#00A651", name: "PSL" },
  vip: { image: "/brand-images/psl-logo.jpeg", color: "#1a472a", name: "PSL 2026" },
};

function matchBrand(deal: any): { image: string | null; color: string; name: string } {
  // Search across all text fields for brand keywords
  const searchText = [
    deal.title,
    deal.description,
    deal.brandName,
    deal.brand?.brandName,
  ].filter(Boolean).join(" ").toLowerCase();

  for (const [key, data] of Object.entries(brandData)) {
    if (searchText.includes(key)) return data;
  }

  // Fallback
  return {
    image: deal.imageUrl || null,
    color: deal.brandColor || "#15803d",
    name: deal.brandName || deal.brand?.brandName || "CricCall",
  };
}

export default function DealsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [claimedDeal, setClaimedDeal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [redeemError, setRedeemError] = useState<Record<string, string>>({});
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const categoryParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
  const { data: dealsData, isLoading } = useDeals({ category: categoryParam });

  const rawDeals = dealsData?.data || dealsData || [];
  const { data: onChainBalance } = useCallBalance();
  const callBalance = onChainBalance
    ? Math.floor(Number(formatCallBalance(onChainBalance as bigint)))
    : Number(user?.cachedCallBalance || 0);

  const canUnlock = (minCall: number) => isAuthenticated && callBalance >= minCall;

  // Show eligible deals first
  const allDeals = [...rawDeals].sort((a: any, b: any) => {
    const aOk = canUnlock(a.minCall || 0) ? 0 : 1;
    const bOk = canUnlock(b.minCall || 0) ? 0 : 1;
    return aOk - bOk;
  });

  const handleRedeem = async (dealId: string) => {
    setRedeeming(dealId);
    setRedeemError((prev) => ({ ...prev, [dealId]: "" }));
    try {
      const result = await api.redeemDeal(dealId);
      const code = result?.couponCode || result?.code || result?.redeemCode;
      if (!code) {
        setRedeemError((prev) => ({ ...prev, [dealId]: "Redemption failed. Please try again." }));
        return;
      }
      setRedeemCode(code);
      setClaimedDeal(dealId);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setRedeemError((prev) => ({ ...prev, [dealId]: "You already redeemed this deal." }));
      } else if (msg.includes("400")) {
        setRedeemError((prev) => ({ ...prev, [dealId]: "Not eligible for this deal." }));
      } else {
        setRedeemError((prev) => ({ ...prev, [dealId]: "Redemption failed. Please try again." }));
      }
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
            const brand = matchBrand(deal);
            const brandName = brand.name;
            const brandColor = brand.color;
            const brandImage = brand.image;

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl border overflow-hidden flex flex-col ${
                  unlocked
                    ? "bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all group"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {/* Brand Banner */}
                <div
                  className="h-32 relative flex items-center justify-center"
                  style={{ backgroundColor: brandColor + "12" }}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: brandColor }}
                  />

                  {brandImage ? (
                    <Image
                      src={brandImage}
                      alt={brandName}
                      width={80}
                      height={80}
                      className="object-contain rounded-xl"
                      style={{ maxHeight: 80 }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-black text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {brandName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Min CALL badge */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    unlocked
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    {unlocked ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    {formatCALL(minCall)} CALL
                  </div>

                  {!unlocked && isAuthenticated && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: brandColor }}
                  >
                    {brandName}
                  </p>
                  <h3
                    className={`text-lg font-bold text-slate-900 leading-tight mb-2 ${
                      !unlocked ? "opacity-70" : ""
                    }`}
                  >
                    {deal.title}
                  </h3>
                  <p
                    className={`text-sm text-slate-500 line-clamp-2 mb-4 ${
                      !unlocked ? "opacity-60" : ""
                    }`}
                  >
                    {deal.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-auto mb-4">
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
                        {daysUntil(deal.expiresAt)}d left
                      </span>
                    )}
                  </div>

                  {/* Action Row */}
                  <div className="pt-4 border-t border-slate-100">
                    {!isAuthenticated ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          Sign in to redeem
                        </span>
                        <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                          Locked
                        </span>
                      </div>
                    ) : unlocked ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Unlocked
                        </span>
                        {claimed ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Claimed
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleRedeem(deal.id)}
                            disabled={redeeming === deal.id}
                            className="px-5 py-2 rounded-lg font-bold text-sm text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                            style={{ backgroundColor: brandColor }}
                          >
                            {redeeming === deal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            {redeeming === deal.id ? "Redeeming..." : "Redeem"}
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          Need {formatCALL(minCall)} CALL
                        </span>
                        <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                          Locked
                        </span>
                      </div>
                    )}
                    {redeemError[deal.id] && redeeming !== deal.id && !claimed && (
                      <p className="text-xs text-red-600 font-medium mt-2">{redeemError[deal.id]}</p>
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
                        {brandName} — {deal.title}
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
