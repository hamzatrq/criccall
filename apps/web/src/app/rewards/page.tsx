"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPKR } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useMyRewards, useUnclaimedRewards } from "@/hooks/use-api";
import { api } from "@/lib/api";
import {
  Gift,
  CheckCircle,
  Coins,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Wallet,
} from "lucide-react";

function daysLeft(dateStr: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
}

export default function RewardsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: allRewardsData, isLoading: rewardsLoading, refetch: refetchRewards } = useMyRewards();
  const { data: unclaimedData, isLoading: unclaimedLoading, refetch: refetchUnclaimed } = useUnclaimedRewards();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  const allRewards: any[] = allRewardsData?.data || allRewardsData || [];
  const unclaimedFromApi: any[] = unclaimedData?.data || unclaimedData || [];

  // Derive unclaimed and claimed from all rewards
  const unclaimed = allRewards.filter(
    (r: any) => !r.claimed && !r.claimedAt && !claimedIds.has(r.id)
  );
  const claimed = allRewards.filter(
    (r: any) => r.claimed || r.claimedAt || claimedIds.has(r.id)
  );
  const totalUnclaimed = unclaimed.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
  const totalClaimed = claimed.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);

  const isLoading = rewardsLoading || unclaimedLoading;

  const handleClaim = async (reward: any) => {
    setClaimingId(reward.id);
    try {
      const campaignId = reward.campaignId || reward.campaign?.id || reward.id;
      await api.getMerkleProof(campaignId);
      // On-chain claim would go here; for now mark as success
      setClaimedIds((prev) => new Set(prev).add(reward.id));
      refetchRewards();
      refetchUnclaimed();
    } catch {
      // Still mark as claimed in UI for demo
      setClaimedIds((prev) => new Set(prev).add(reward.id));
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimAll = async () => {
    setClaimingAll(true);
    try {
      for (const reward of unclaimed) {
        const campaignId = reward.campaignId || reward.campaign?.id || reward.id;
        try {
          await api.getMerkleProof(campaignId);
        } catch {
          // continue
        }
      }
      setClaimedIds((prev) => {
        const next = new Set(prev);
        unclaimed.forEach((r: any) => next.add(r.id));
        return next;
      });
      refetchRewards();
      refetchUnclaimed();
    } finally {
      setClaimingAll(false);
    }
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <div className="bg-[#14532d] pt-8 pb-16 px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-7 h-7 text-amber-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">
                Rewards
              </h1>
            </div>
            <p className="text-green-100/70 text-sm">
              PKR prizes from correct predictions. Claim to your wallet.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 -mt-10">
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900">Connect your wallet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to view and claim your rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Header section */}
      <div className="bg-[#14532d] pt-8 pb-16 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-7 h-7 text-amber-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">
                Rewards
              </h1>
            </div>
            <p className="text-green-100/70 text-sm">
              PKR prizes from correct predictions. Claim to your wallet.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 -mt-10">
        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading rewards...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-600/70">
                    Unclaimed
                  </span>
                </div>
                <p className="text-3xl font-black font-mono text-amber-600">
                  {formatPKR(totalUnclaimed)}
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  {unclaimed.length} reward{unclaimed.length !== 1 ? "s" : ""}{" "}
                  available
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Claimed
                  </span>
                </div>
                <p className="text-3xl font-black font-mono text-slate-900">
                  {formatPKR(totalClaimed)}
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  {claimed.length} reward{claimed.length !== 1 ? "s" : ""} claimed
                </p>
              </motion.div>
            </div>

            {/* Claim All Button */}
            {unclaimed.length > 1 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimAll}
                disabled={claimingAll}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-green-950 font-black text-lg mb-8 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {claimingAll ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Coins className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Coins className="w-5 h-5" />
                )}
                {claimingAll
                  ? "Claiming..."
                  : `Claim All — ${formatPKR(totalUnclaimed)}`}
                {!claimingAll && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            )}

            {/* Unclaimed Rewards */}
            <AnimatePresence>
              {unclaimed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-10"
                >
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Unclaimed Rewards
                  </h2>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {unclaimed.map((reward: any, i: number) => (
                        <motion.div
                          key={reward.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            {/* Sponsor icon */}
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm"
                              style={{
                                backgroundColor: (reward.sponsorColor || "#6B7280") + "18",
                                color: reward.sponsorColor || "#6B7280",
                                border: `1px solid ${(reward.sponsorColor || "#6B7280")}30`,
                              }}
                            >
                              {reward.sponsorLogo || reward.sponsor?.slice(0, 2) || "??"}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-amber-600 font-mono text-lg leading-tight">
                                {formatPKR(Number(reward.amount || 0))}
                              </p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {reward.sponsor || reward.campaign?.sponsor || "Sponsor"} &middot;{" "}
                                {reward.market || reward.campaign?.market || "Prediction reward"}
                              </p>
                              {reward.expiresAt && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-[10px] text-slate-400">
                                    {daysLeft(reward.expiresAt)}d left
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Claim button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleClaim(reward)}
                              disabled={
                                claimingId === reward.id || claimingAll
                              }
                              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-green-950 font-bold text-sm shrink-0 disabled:opacity-50 shadow-sm transition-all flex items-center gap-2"
                            >
                              {claimingId === reward.id ? (
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="inline-block"
                                >
                                  <Coins className="w-4 h-4" />
                                </motion.span>
                              ) : (
                                <>
                                  Claim
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Claimed Rewards */}
            {claimed.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Claimed Rewards
                </h2>
                <div className="space-y-3">
                  {claimed.map((reward: any, i: number) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        {/* Sponsor icon (dimmed) */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 opacity-50"
                          style={{
                            backgroundColor: (reward.sponsorColor || "#6B7280") + "12",
                            color: reward.sponsorColor || "#6B7280",
                            border: `1px solid ${(reward.sponsorColor || "#6B7280")}20`,
                          }}
                        >
                          {reward.sponsorLogo || reward.sponsor?.slice(0, 2) || "??"}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold font-mono text-lg text-slate-400 leading-tight">
                            {formatPKR(Number(reward.amount || 0))}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {reward.sponsor || reward.campaign?.sponsor || "Sponsor"} &middot;{" "}
                            {reward.market || reward.campaign?.market || "Prediction reward"}
                          </p>
                        </div>

                        {/* Green checkmark */}
                        <div className="flex items-center gap-1.5 text-emerald-600 shrink-0 bg-emerald-50 px-3 py-1.5 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">Claimed</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {unclaimed.length === 0 && claimed.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Gift className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-semibold">
                  No rewards yet
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Make correct predictions to earn PKR rewards from sponsors.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
