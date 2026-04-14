"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPKR } from "@/data/mock";
import {
  Gift,
  CheckCircle,
  Coins,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface Reward {
  id: string;
  campaignId: string;
  sponsor: string;
  sponsorLogo: string;
  sponsorColor: string;
  market: string;
  amount: number;
  claimed: boolean;
  claimedAt?: string;
  expiresAt: string;
}

const mockRewards: Reward[] = [
  {
    id: "r1",
    campaignId: "PAK-IND-PTCL",
    sponsor: "PTCL",
    sponsorLogo: "PTCL",
    sponsorColor: "#00A651",
    market: "PAK vs IND — Will Pakistan score 180+?",
    amount: 2500,
    claimed: false,
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    campaignId: "PAK-IND-FP",
    sponsor: "Foodpanda",
    sponsorLogo: "FP",
    sponsorColor: "#D70F64",
    market: "PAK vs IND — Will Pakistan score 180+?",
    amount: 500,
    claimed: false,
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r5",
    campaignId: "PAK-IND-JZ",
    sponsor: "Jazz",
    sponsorLogo: "JZ",
    sponsorColor: "#ED1C24",
    market: "PAK vs IND — Will Pakistan win?",
    amount: 800,
    claimed: false,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    campaignId: "SA-NZ-KFC",
    sponsor: "KFC",
    sponsorLogo: "KFC",
    sponsorColor: "#E4002B",
    market: "SA vs NZ — Will South Africa win?",
    amount: 1200,
    claimed: true,
    claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r4",
    campaignId: "AUS-ENG-CC",
    sponsor: "CricCall",
    sponsorLogo: "CC",
    sponsorColor: "#00FF6A",
    market: "AUS vs ENG — Will Australia win?",
    amount: 150,
    claimed: true,
    claimedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function daysLeft(dateStr: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
}

export default function RewardsPage() {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  const unclaimed = mockRewards.filter(
    (r) => !r.claimed && !claimedIds.has(r.id)
  );
  const claimed = mockRewards.filter(
    (r) => r.claimed || claimedIds.has(r.id)
  );
  const totalUnclaimed = unclaimed.reduce((sum, r) => sum + r.amount, 0);
  const totalClaimed = claimed.reduce((sum, r) => sum + r.amount, 0);

  const handleClaim = (id: string) => {
    setClaimingId(id);
    setTimeout(() => {
      setClaimedIds((prev) => new Set(prev).add(id));
      setClaimingId(null);
    }, 1500);
  };

  const handleClaimAll = () => {
    setClaimingAll(true);
    setTimeout(() => {
      setClaimedIds((prev) => {
        const next = new Set(prev);
        unclaimed.forEach((r) => next.add(r.id));
        return next;
      });
      setClaimingAll(false);
    }, 2000);
  };

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
                  {unclaimed.map((reward, i) => (
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
                            backgroundColor: reward.sponsorColor + "18",
                            color: reward.sponsorColor,
                            border: `1px solid ${reward.sponsorColor}30`,
                          }}
                        >
                          {reward.sponsorLogo}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-amber-600 font-mono text-lg leading-tight">
                            {formatPKR(reward.amount)}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {reward.sponsor} &middot; {reward.market}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-400">
                              {daysLeft(reward.expiresAt)}d left
                            </span>
                          </div>
                        </div>

                        {/* Claim button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleClaim(reward.id)}
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
              {claimed.map((reward, i) => (
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
                        backgroundColor: reward.sponsorColor + "12",
                        color: reward.sponsorColor,
                        border: `1px solid ${reward.sponsorColor}20`,
                      }}
                    >
                      {reward.sponsorLogo}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono text-lg text-slate-400 leading-tight">
                        {formatPKR(reward.amount)}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {reward.sponsor} &middot; {reward.market}
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
      </div>
    </div>
  );
}
