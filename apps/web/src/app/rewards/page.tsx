"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPKR } from "@/data/mock";
import { Gift, CheckCircle, Clock, ExternalLink, Coins } from "lucide-react";

interface Reward {
  id: string;
  campaignId: string;
  sponsor: string;
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
    sponsorColor: "#D70F64",
    market: "PAK vs IND — Will Pakistan score 180+?",
    amount: 500,
    claimed: false,
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    campaignId: "SA-NZ-KFC",
    sponsor: "KFC",
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
    sponsorColor: "#00FF6A",
    market: "AUS vs ENG — Will Australia win?",
    amount: 150,
    claimed: true,
    claimedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function RewardsPage() {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  const unclaimed = mockRewards.filter((r) => !r.claimed && !claimedIds.has(r.id));
  const claimed = mockRewards.filter((r) => r.claimed || claimedIds.has(r.id));
  const totalUnclaimed = unclaimed.reduce((sum, r) => sum + r.amount, 0);
  const totalClaimed = claimed.reduce((sum, r) => sum + r.amount, 0);

  const handleClaim = (id: string) => {
    setClaimingId(id);
    setTimeout(() => {
      setClaimedIds((prev) => new Set(prev).add(id));
      setClaimingId(null);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Rewards</h1>
      <p className="text-slate-500 text-sm mb-8">
        PKR prizes from correct predictions. Claim to your wallet.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-amber-200 bg-amber-50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-xs uppercase tracking-wider text-amber-600/60">
              Unclaimed
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-amber-600">
            {formatPKR(totalUnclaimed)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {unclaimed.length} reward{unclaimed.length !== 1 ? "s" : ""} available
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Claimed
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900">
            {formatPKR(totalClaimed)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {claimed.length} reward{claimed.length !== 1 ? "s" : ""} claimed
          </p>
        </motion.div>
      </div>

      {/* Claim All button */}
      {unclaimed.length > 1 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl bg-[#FFD700] text-black font-bold text-lg mb-8 shadow-md hover:shadow-lg transition-shadow"
        >
          <Coins className="w-5 h-5 inline mr-2" />
          Claim All — {formatPKR(totalUnclaimed)}
        </motion.button>
      )}

      {/* Unclaimed Rewards */}
      {unclaimed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            Unclaimed
          </h2>
          <div className="space-y-3">
            {unclaimed.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: reward.sponsorColor + "20",
                      color: reward.sponsorColor,
                    }}
                  >
                    {reward.sponsor.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-600 font-mono text-lg">
                      {formatPKR(reward.amount)}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {reward.sponsor} · {reward.market}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClaim(reward.id)}
                    disabled={claimingId === reward.id}
                    className="px-5 py-2.5 rounded-lg bg-[#FFD700] text-black font-bold text-sm shrink-0 disabled:opacity-50"
                  >
                    {claimingId === reward.id ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        {"\u{23F3}"}
                      </motion.span>
                    ) : (
                      "Claim"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed Rewards */}
      {claimed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Claimed
          </h2>
          <div className="space-y-3">
            {claimed.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 opacity-60"
                    style={{
                      backgroundColor: reward.sponsorColor + "20",
                      color: reward.sponsorColor,
                    }}
                  >
                    {reward.sponsor.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-mono text-lg text-slate-500">
                      {formatPKR(reward.amount)}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {reward.sponsor} · {reward.market}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Claimed</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
